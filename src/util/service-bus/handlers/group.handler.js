const { models } = require('../../../models');
const logger = require('../../logger/logger.util');

const calculateGroupActivityLeaderBoard = async ({
  group_activity_id,
  start_date,
  end_date,
  activity_type_id,
  activity_metric,
}) => {
  if (activity_type_id > 2) {
    start_date = start_date.startOf('month').format('YYYY-MM-DD HH:MM:ss');
    end_date = end_date.endOf('month').format('YYYY-MM-DD HH:MM:ss');
  } else {
    start_date = start_date.startOf('month').format('YYYY-MM-DD');
    end_date = end_date.endOf('month').format('YYYY-MM-DD');
  }
  const { group_activity_leaderboard } = models;
  try {
    let query;
    switch (activity_type_id) {
      case 1:
        query = `INSERT INTO activity_tracker.group_activity_leaderboards(value, user_rank, hrx_id, group_activity_id, createdAt, updatedAt, firstName, lastName, profileImageUrl)
              SELECT sum(activity_steps.count) as ${activity_metric},
              ROW_NUMBER() OVER(ORDER BY sum(activity_steps.count) DESC) as user_rank, users.hrx_id, group_activity_mappings.group_activity_id, NOW(), NOW(), users.firstName, users.lastName, JSON_UNQUOTE(JSON_EXTRACT(payload, '$.profileImageUrl'))
              FROM users INNER JOIN activity_steps ON users.hrx_id = activity_steps.hrx_id INNER JOIN group_activity_mappings ON users.hrx_id = group_activity_mappings.hrx_id
              where group_activity_id = '${group_activity_id}' and is_flagged = 0 AND group_activity_mappings.status='active' and synced_at between '${start_date}' and '${end_date}'
              GROUP BY users.hrx_id
              ORDER BY ${activity_metric} DESC; `;
        break;
      case 39:
      case 2:
        query = `INSERT INTO group_activity_leaderboards (hrx_id, group_activity_id, user_rank, value, firstName, lastName, profileImageUrl, createdAt, updatedAt)
            SELECT users.hrx_id, group_activity_mappings.group_activity_id AS group_activity_id, ROW_NUMBER() OVER (ORDER BY SUM(weight_progresses.progress) DESC) AS user_rank, SUM(weight_progresses.progress) AS user_progress, users.firstName, users.lastName, JSON_UNQUOTE(JSON_EXTRACT(payload, '$.profileImageUrl')), NOW(), NOW()
            FROM users 
            JOIN group_activity_mappings ON users.hrx_id =  group_activity_mappings.hrx_id
            JOIN weight_progresses ON users.hrx_id = weight_progresses.hrx_id
            WHERE group_activity_mappings.group_activity_id = '${group_activity_id}' AND weight_progresses.start BETWEEN '${start_date}' AND '${end_date}'
            AND group_activity_mappings.status='active'
            GROUP BY users.hrx_id
            ORDER BY user_rank;`;
        break;
      default:
        query = `INSERT INTO group_activity_leaderboards (hrx_id, group_activity_id, user_rank, value, firstName, lastName, profileImageUrl, createdAt, updatedAt)
          SELECT users.hrx_id, group_activity_mappings.group_activity_id AS group_activity_id, ROW_NUMBER() OVER (ORDER BY SUM(workout_activities.${
            activity_metric === 'distance' ? 'workout_value' : activity_metric
          }) DESC) AS user_rank, SUM(workout_activities.${
          activity_metric === 'distance' ? 'workout_value' : activity_metric
        }) AS user_progress, users.firstName, users.lastName, JSON_UNQUOTE(JSON_EXTRACT(payload, '$.profileImageUrl')), NOW(), NOW()
          FROM users 
          JOIN group_activity_mappings ON users.hrx_id =  group_activity_mappings.hrx_id
          JOIN workout_activities ON group_activity_mappings.hrx_id = workout_activities.hrx_id
          WHERE group_activity_mappings.group_activity_id = '${group_activity_id}' AND workout_activities.type_id = ${parseInt(
          activity_type_id,
          10
        )}
          AND group_activity_mappings.status='active'
          AND workout_activities.activity_start BETWEEN '${start_date}' AND '${end_date}'
          GROUP BY 
            users.hrx_id
          ORDER BY user_rank;
            `;
        break;
    }
    await group_activity_leaderboard.sequelize.query(query);
  } catch (err) {
    logger.error(err);
    return {};
  }
};

module.exports = {
  calculateGroupActivityLeaderBoard,
};
