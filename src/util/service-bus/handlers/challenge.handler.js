const boom = require('@hapi/boom');
const dayjs = require('dayjs');
const moment = require('moment');
const isToday = require('dayjs/plugin/isToday');
const _ = require('lodash');
const { Op, Sequelize } = require('sequelize');
const { models } = require('../../../models');
const {
  getActivityMetric,
} = require('../../../modules/v1/activity-types/activity-types.service');
const { createInAppNotifications } = require('../../cms.util');
const constants = require('../../constants');
const logger = require('../../logger/logger.util');
const {
  addToSortedSet,
  deleteFromSet,
} = require('../../database/redis-wrapper');
const {
  fetchWeightProgress,
} = require('../../../modules/v1/weight/weight.util');
const {
  fetchActivityMetric,
} = require('../../../modules/v1/group-activity/group-activity.util');
const {
  challengeDetails: challengeDetailsV2,
} = require('../../../modules/v2/challenges/challenges.service');

dayjs.extend(isToday);

const getChallengeData = async (challenge_id) => {
  const { completed_challenge, challenges, user_challenge } = models;
  const challenge = await completed_challenge.findOne({
    where: { challenge_id },
  });
  if (!_.isNil(challenge)) {
    throw boom.boomify(
      new Error('Challenge already exists in completed challenges'),
      { statusCode: 412 }
    );
  }
  const challenge_details = await challenges.findOne({
    where: { id: challenge_id },
    raw: true,
  });
  const metric = await getActivityMetric({
    activity_type_id: _.get(challenge_details, 'activity_type_id'),
  });
  const participants = await user_challenge.findAll({
    where: {
      challenge_id,
      reason: 'active',
    },
    raw: true,
  });
  return {
    challenge_details,
    metric,
    participants,
  };
};

const createCompletedChallenge = async (challenge_id) => {
  const { completed_challenge } = models;
  const { challenge_details, metric, participants } = await getChallengeData(
    challenge_id
  );
  let end_date = dayjs(_.get(challenge_details, 'end')).add(1, 'days');
  if (!end_date.isToday() && dayjs().isBefore(end_date)) {
    throw boom.boomify(
      new Error('Staled Event. Challenge end date has been extended.'),
      { statusCode: 425 }
    );
  }
  end_date = end_date.format('YYYY-MM-DD');
  switch (_.get(challenge_details, 'activity_type_id')) {
    case '1':
      await completed_challenge.sequelize.query(
        `INSERT INTO activity_tracker.completed_challenges (
          count,
          user_rank,
          hrx_id,
          challenge_id,
          achieved_on,
          createdAt,
          updatedAt
      )
      SELECT
          sum(activity_steps.count) AS total_steps,
          ROW_NUMBER() OVER (ORDER BY user_challenges.target_achieved DESC, user_challenges.achieved_on ASC, sum(activity_steps.count) DESC) AS user_rank,
          user_challenges.hrx_id,
          user_challenges.challenge_id,
          user_challenges.achieved_on,
          NOW(),
          NOW()
      FROM
          user_challenges
      INNER JOIN
          activity_steps ON user_challenges.hrx_id = activity_steps.hrx_id
      WHERE
          challenge_id = '${_.get(challenge_details, 'id')}'
          AND user_challenges.reason = 'active'
          AND synced_at BETWEEN '${_.get(
            challenge_details,
            'start'
          )}' AND '${_.get(challenge_details, 'end')}'
      GROUP BY
          user_challenges.hrx_id;
      `
      );
      break;
    case '39':
    case '2':
      await completed_challenge.sequelize.query(
        `INSERT INTO activity_tracker.completed_challenges (count, user_rank, hrx_id, challenge_id, achieved_on, createdAt, updatedAt)
        SELECT
            progress,
            ROW_NUMBER() OVER (ORDER BY uc.target_achieved DESC,uc.achieved_on ASC, (progress * 100) / (start_weight - target_weight) DESC) AS user_rank,
            X.hrx_id,
            X.challenge_id,
            uc.achieved_on,
            NOW(),
            NOW()
        FROM (
            SELECT
                (progress * 100) / (start_weight - target_weight) AS progress,
                hrx_id,
                challenge_id
            FROM activity_tracker.weight_progresses
            WHERE challenge_id = '${_.get(challenge_details, 'id')}'
        ) AS X
        INNER JOIN activity_tracker.user_challenges uc ON X.challenge_id = uc.challenge_id AND X.hrx_id = uc.hrx_id;`
      );
      break;
    default:
      await completed_challenge.sequelize
        .query(`INSERT INTO activity_tracker.completed_challenges (
          count,
          user_rank,
          hrx_id,
          challenge_id,
          achieved_on,
          createdAt,
          updatedAt
      )
      SELECT
          ${_.get(metric, 'metric')} AS count,
          user_rank,
          hrx_id,
          challenge_id,
          achieved_on,
          NOW() AS createdAt,
          NOW() AS updatedAt
      FROM (
          SELECT
              uc.hrx_id AS hrx_id,
              SUM(${_.get(metric, 'metric')}) AS ${_.get(metric, 'metric')},
              uc.challenge_id AS challenge_id,
              uc.achieved_on as achieved_on,
              ROW_NUMBER() OVER (
                  ORDER BY uc.target_achieved DESC,uc.achieved_on ASC, SUM(${_.get(
                    metric,
                    'metric'
                  )}) DESC
              ) AS user_rank
          FROM user_challenges AS uc
          INNER JOIN challenges ON challenges.id = uc.challenge_id
          INNER JOIN workout_activities AS wa ON uc.hrx_id = wa.hrx_id
          WHERE
              challenge_id = '${_.get(challenge_details, 'id')}'
              AND type_id = ${parseInt(
                _.get(challenge_details, 'activity_type_id'),
                10
              )}
              AND reason = 'active'
              AND status = 'active'
              AND wa.activity_start BETWEEN '${_.get(
                challenge_details,
                'start'
              )}' AND '${end_date}'
          GROUP BY uc.hrx_id
      ) AS X;
      `);
  }
  if (_.get(challenge_details, 'is_milestone')) {
    for (const [index, user] of participants.entries()) {
      setTimeout(() => {
        createInAppNotifications({
          hrx_id: _.get(user, 'hrx_id'),
          expires_at: dayjs().add(2, 'days').format('YYYY-MM-DD'),
          challengeId: challenge_id,
          ...constants.HRX_CMS.NOTIFICATION.COMPLETED_CHALLENGE,
        });
      }, 3000 * index);
    }
  }
  deleteFromSet(challenge_id);
  logger.info(`Challenge ${_.get(challenge_details, 'id')} completed.`);
};

const fetchTotalSteps = async ({ hrx_id, start_date, end_date }) => {
  const { activity_steps } = models;
  const data = await activity_steps.sum('count', {
    where: {
      hrx_id,
      synced_at: {
        [Op.gte]: moment(start_date).startOf('start_date').toISOString(),
        [Op.lte]: moment(end_date).endOf('end_date').toISOString(),
      },
    },
    raw: true,
  });
  return data;
};

const challengeCompletion = async ({ hrx_id, challenge_id }) => {
  const { user_challenge } = models;
  const data = await user_challenge.update(
    {
      achieved_on: dayjs(),
      target_achieved: true,
    },
    {
      where: { challenge_id, hrx_id },
    }
  );
  return data;
};

const getGroupAgainstChallenge = async ({ hrx_id, challenge_id }) => {
  const { group_challenge_mapping } = models;
  try {
    let [{ group_id }] = await group_challenge_mapping.sequelize.query(
      `SELECT distinct(group_challenge_mappings.group_id) as group_id FROM group_challenge_mappings inner join group_hrx_mappings 
      on group_challenge_mappings.group_id = group_hrx_mappings.group_id
      where hrx_id = '${hrx_id}' and challenge_id='${challenge_id}'`,
      {
        type: group_challenge_mapping.sequelize.QueryTypes.SELECT,
      }
    );
    return group_id;
  } catch (err) {
    return '';
  }
};

const updateRank = async ({
  hrx_id,
  challenge_id,
  start_date,
  end_date,
  type_id,
  target_achieved,
}) => {
  let count;
  let challenge = await challengeDetailsV2({ challenge_id });
  challenge = _.find(_.get(challenge, 'activity_tracker'), {
    __component: 'wellness.challenge',
  });

  let activity_type_id = _.get(challenge, 'activity_type_id');
  switch (parseInt(activity_type_id, 10)) {
    case 1:
      if (type_id === 1)
        count = await fetchTotalSteps({ hrx_id, start_date, end_date });
      break;
    case 2:
      if (type_id === 2)
        count = await fetchWeightProgress({ hrx_id, challenge_id });
      break;
    default:
      if (type_id !== 1 || type_id !== 2) {
        const activity_metric = await getActivityMetric({ activity_type_id });
        count = await fetchActivityMetric({
          metric: _.get(activity_metric, 'metric'),
          hrx_id,
          challenge_type: _.get(
            challenge,
            'metadata.activity_ids',
            activity_type_id
          ),
          start_date,
          end_date,
        });
      }
      break;
  }
  if (count) {
    if (_.get(challenge, 'challenge_mode') === 'group') {
      const group_id = await getGroupAgainstChallenge({ hrx_id, challenge_id });
      challenge_id = `${challenge_id}-${group_id}`;
    }
    await addToSortedSet(
      challenge_id,
      count,
      hrx_id,
      _.get(challenge, 'metadata.refresh_time', 14400)
    );
    if (
      count >= _.get(challenge, 'target') &&
      !target_achieved &&
      _.get(challenge, 'target') > 0
    )
      await challengeCompletion({ hrx_id, challenge_id });
  }
  return count;
};

const getActiveChallenges = async ({ hrx_id }) => {
  const { user_challenge } = models;
  const now = moment().local().format('YYYY-MM-DD');
  const data = await user_challenge.findAll({
    attributes: ['challenge_id', 'started_at', 'ended_at', 'target_achieved'],
    where: {
      hrx_id,
      reason: 'active',
      started_at: {
        [Op.lte]: now,
      },
      ended_at: {
        [Op.gte]: Sequelize.literal(`DATE_SUB('${now}', INTERVAL 1 DAY)`),
      },
    },
    raw: true,
  });
  return data;
};

const updateChallengeForUser = async ({ hrx_id, synced_at, type_id }) => {
  let date = moment(synced_at).format('YYYY-MM-DD');
  let current_date = moment().format('YYYY-MM-DD');
  if (!moment(date).isSame(current_date)) return {};
  const data = await getActiveChallenges({ hrx_id });
  let promise = [];
  data.forEach((each) =>
    promise.push(
      updateRank({
        hrx_id,
        challenge_id: _.get(each, 'challenge_id'),
        start_date: _.get(each, 'started_at'),
        end_date: _.get(each, 'ended_at'),
        target_achieved: _.get(each, 'target_achieved'),
        type_id,
      })
    )
  );
  return await Promise.all(promise);
};

const getGroupsCountAgainstChallenge = async ({ challenge_id }) => {
  const { group_challenge_mapping } = models;
  let count = await group_challenge_mapping.count({
    where: { challenge_id },
    raw: true,
  });
  return count;
};

module.exports = {
  createCompletedChallenge,
  updateChallengeForUser,
  updateRank,
  getGroupAgainstChallenge,
  getGroupsCountAgainstChallenge,
};
