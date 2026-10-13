class OrderStateError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'OrderStateError';
    this.statusCode = statusCode;
  }
}

// Base class: the common interface. The default behaviour is "not allowed".
class OrderState {
  constructor(name) {
    this.name = name;
  }

  allowedActions() {
    return [];
  }

  canCancel() {
    return this.allowedActions().includes('cancel');
  }

  cancel(order) {
    throw new OrderStateError(
      `An order in status '${this.name}' cannot be cancelled`
    );
  }
}

class PlacedState extends OrderState {
  constructor() {
    super('placed');
  }

  allowedActions() {
    return ['cancel'];
  }

  cancel(order) {
    order.status = 'cancelled';
    return order;
  }
}

class PreparingState extends OrderState {
  constructor() {
    super('preparing');
  }
}

class OutForDeliveryState extends OrderState {
  constructor() {
    super('out_for_delivery');
  }
}

class DeliveredState extends OrderState {
  constructor() {
    super('delivered');
  }
}

class CancelledState extends OrderState {
  constructor() {
    super('cancelled');
  }
}

const STATE_CLASSES = {
  placed: PlacedState,
  preparing: PreparingState,
  out_for_delivery: OutForDeliveryState,
  delivered: DeliveredState,
  cancelled: CancelledState,
};

// Returns the state object for a status string.
function getOrderState(status) {
  const StateClass = STATE_CLASSES[status];
  if (!StateClass) {
    throw new OrderStateError(`Unknown order status '${status}'`, 500);
  }
  return new StateClass();
}

module.exports = {
  OrderState,
  PlacedState,
  PreparingState,
  OutForDeliveryState,
  DeliveredState,
  CancelledState,
  OrderStateError,
  getOrderState,
};