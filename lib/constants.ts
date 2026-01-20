export const ORDER_STATUSES = {
  all: 'Tất cả',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang chuẩn bị hàng',
  ready_to_ship: 'Sẵn sàng vận chuyển',
  delivering: 'Đang vận chuyển',
  finished: 'Đã giao',
  request_refund: 'Yêu cầu hoàn tiền',
  refunded: 'Đã hoàn tiền/Hoàn trả',
  cancelled: 'Đã hủy đơn',
};

export type OrderStatus = keyof typeof ORDER_STATUSES;
