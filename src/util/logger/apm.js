const apm = require('elastic-apm-node');

const preSpan = ({
  traceparent,
  span_name,
  span_type,
  transaction_name,
  transaction_type,
  should_create_transaction = false,
  labels = [],
  contexts = [],
}) => {
  if (!traceparent) return () => {};

  let transaction;
  let span;

  if (should_create_transaction) {
    transaction = apm.startTransaction(transaction_name, transaction_type, {
      childOf: traceparent?.toString(),
    });

    span = transaction && transaction?.startSpan(span_name, span_type);
  } else {
    span = apm.startSpan(span_name, span_type, {
      exitSpan: true,
      childOf: traceparent?.toString(),
    });
  }

  // eslint-disable-next-line no-unused-expressions
  labels?.forEach((label) => {
    apm.setLabel(label?.name, label?.value);
  });

  // eslint-disable-next-line no-unused-expressions
  contexts?.forEach((context) => {
    apm.setCustomContext(context);
  });

  return (success) => {
    if (span) {
      span.setOutcome(success ? 'success' : 'failure');
      span.end();
    }
    if (transaction) {
      transaction.end();
    }
  };
};

const attachSpan = async (cb, errorHandler, config) => {
  const cleanUp = preSpan(config);
  let success = true;
  try {
    await cb();
  } catch (err) {
    success = false;
    if (errorHandler) {
      errorHandler(err);
    }
  }
  cleanUp(success);
};

module.exports = { attachSpan };
