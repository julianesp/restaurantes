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

// Tipos para estadísticas predictivas
export interface PredictiveDishAnalysis {
  item_id: string;
  item_name: string;
  item_description: string;
  item_price: number;
  total_orders: number;
  days_ordered: number;
  frequency_score: number;
  avg_daily_quantity: number;
  recommended_prep_quantity: number;
  peak_hour_start: number;
  peak_hour_end: number;
  consistency_rating: 'MUY_ALTA' | 'ALTA' | 'MEDIA' | 'BAJA' | 'MUY_BAJA';
  preparation_priority: number;
}

export interface HourlyOrderPattern {
  hour_of_day: number;
  total_orders: number;
  total_items_sold: number;
  top_item_name: string;
  top_item_quantity: number;
  avg_order_value: number;
}

export interface CustomerFavoritePattern {
  item_id: string;
  item_name: string;
  item_description: string;
  unique_customers: number;
  repeat_order_rate: number;
  total_repeat_orders: number;
  avg_days_between_orders: number;
  loyalty_score: number;
}
