const _ = require('lodash');
const moment = require('moment');

const { hrxToPhr } = require('../../identity.util');
const { post, postHours } = require('../../../modules/v1/step/step.service');
const { sendVoucherRxBulk } = require('../../voucherrx');
const { addWorkout } = require('../../../modules/v1/workout/workout.util');

const storeData = async ({
  dayPayload,
  hourPayload,
  workOutPayload,
  hrx_id,
  platform,
}) => {
  const orderedDayPayload = {};
  _(dayPayload)
    .keys()
    .sort()
    .each((key) => {
      orderedDayPayload[key] = dayPayload[key];
    });
  let reward_events = [];
  const phr_id = await hrxToPhr({ hrx_id });
  for (let day in orderedDayPayload) {
    if (_.has(orderedDayPayload, day)) {
      let value = orderedDayPayload[day];
      let startDate = moment(day, 'DD/MM/YYYY');
      const data =
        (await post({
          hrx_id,
          provider: platform,
          payload: { value, startDate },
          phr_id,
        })) || [];
      reward_events = [...reward_events, ...data];
    }
  }
  if (!_.isEmpty(reward_events)) {
    sendVoucherRxBulk({ hrx_id, events: reward_events });
  }
  Promise.all([
    _.forEach(hourPayload, (value) => {
      dayPayload = postHours({
        hrx_id,
        payload: value,
      });
    }),
  ]);
  for (const value of workOutPayload) {
    await addWorkout({
      hrx_id,
      ...value,
    });
  }
};

module.exports = {
  storeData,
};
