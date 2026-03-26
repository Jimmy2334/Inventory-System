import { StorageManager }     from '../utils/StorageManager.js';
import { ActivityLogService } from './ActivityLogService.js';

const RESOURCE = 'orders';

export class OrderService {

  // ******************** READ ********************

  static async getAll() {
    return StorageManager.getAll(RESOURCE);
  }

  static async getById(id) {
    return StorageManager.getById(RESOURCE, id);
  }

  static async getBySupplier(supplierId) {
    return StorageManager.getWhere(RESOURCE, { supplierId });
  }

  // ******************** WRITE ********************

  static async add(data) {
    const validation = OrderService._validate(data);
    if (!validation.ok) return validation;

    const supplier = await StorageManager.getById('suppliers', data.supplierId);
    if (!supplier) return { ok: false, error: 'Selected supplier does not exist.' };

    const product = await StorageManager.getById('products', data.productId);
    if (!product) return { ok: false, error: 'Selected product does not exist.' };

    const order = {
      id          : crypto.randomUUID(),
      supplierId  : data.supplierId,
      productId   : data.productId,
      quantity    : Number(data.quantity),
      orderDate   : data.orderDate,
      status      : 'Pending',
      receivedDate: null,
    };

    const created = await StorageManager.create(RESOURCE, order);

    await ActivityLogService.log(
      'order_add',
      `New order: ${product.name} x${order.quantity} from ${supplier.name}`
    );

    return { ok: true, order: created };
  }

  static async markReceived(id) {
    const order = await StorageManager.getById(RESOURCE, id);
    if (!order) return { ok: false, error: 'Order not found.' };

    if (order.status === 'Received') {
      return { ok: false, error: 'This order has already been received.' };
    }
    if (order.status === 'Cancelled') {
      return { ok: false, error: 'Cannot receive a cancelled order.' };
    }

    // Add quantity to product stock
    const product = await StorageManager.getById('products', order.productId);
    if (!product) {
      return { ok: false, error: 'Linked product no longer exists. Cannot update stock.' };
    }

    await StorageManager.patch('products', product.id, {
      quantity: (product.quantity ?? 0) + order.quantity,
    });

    const updated = await StorageManager.patch(RESOURCE, id, {
      status      : 'Received',
      receivedDate: new Date().toISOString(),
    });

    await ActivityLogService.log(
      'order_received',
      `Order received: productId=${order.productId} +${order.quantity} units from supplierId=${order.supplierId}`
    );

    return { ok: true, order: updated };
  }

  static async cancel(id) {
    const order = await StorageManager.getById(RESOURCE, id);
    if (!order) return { ok: false, error: 'Order not found.' };

    if (order.status === 'Received') {
      return { ok: false, error: 'Cannot cancel an order that has already been received.' };
    }
    if (order.status === 'Cancelled') {
      return { ok: false, error: 'Order is already cancelled.' };
    }

    const updated = await StorageManager.patch(RESOURCE, id, {
      status     : 'Cancelled',
      cancelledAt: new Date().toISOString(),
    });

    await ActivityLogService.log(
      'order_cancel',
      `Order cancelled: productId=${order.productId} from supplierId=${order.supplierId}`
    );

    return { ok: true, order: updated };
  }

  static async delete(id) {
    const order = await StorageManager.getById(RESOURCE, id);
    if (!order) return { ok: false, error: 'Order not found.' };

    if (order.status !== 'Cancelled') {
      return { ok: false, error: 'Only cancelled orders can be deleted. Cancel it first.' };
    }

    await StorageManager.delete(RESOURCE, id);

    await ActivityLogService.log(
      'order_delete',
      `Order deleted: productId=${order.productId} from supplierId=${order.supplierId}`
    );

    return { ok: true };
  }

  // ******************** VALIDATION ********************

  static _validate(data) {
    if (!data.supplierId) return { ok: false, error: 'Please select a supplier.' };
    if (!data.productId)  return { ok: false, error: 'Please select a product.' };

    const qty = Number(data.quantity);
    if (!data.quantity || isNaN(qty) || qty < 1) {
      return { ok: false, error: 'Quantity must be at least 1.' };
    }
    if (!Number.isInteger(qty)) {
      return { ok: false, error: 'Quantity must be a whole number.' };
    }
    if (!data.orderDate) return { ok: false, error: 'Order date is required.' };

    return { ok: true };
  }
}