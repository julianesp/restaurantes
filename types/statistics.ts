// Tipos para las estadísticas de platos más pedidos

export type TimeFilter = 'today' | 'week' | 'month' | 'all';

export type StatisticsType = 'items' | 'top' | 'summary';

export interface ItemStatistic {
  item_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  order_count: number;
  total_quantity_sold: number;
  total_revenue: number;
  first_ordered_at: string;
  last_ordered_at: string;
  avg_quantity_per_order: number;
}

export interface TopItem {
  item_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  order_count: number;
  total_quantity_sold: number;
  total_revenue: number;
  rank_position: number;
}

export interface SalesSummary {
  total_orders: number;
  total_items_sold: number;
  total_revenue: number;
  unique_items_count: number;
  avg_order_value: number;
  most_popular_item: string;
  most_popular_item_quantity: number;
}

export interface StatisticsResponse<T> {
  success: boolean;
  type: StatisticsType;
  timeFilter: TimeFilter;
  data: T;
}

export interface TrendData {
  date: string;
  total_orders: number;
  total_revenue: number;
  items_sold: number;
}
