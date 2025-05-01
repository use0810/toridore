export type OrderDetail = {
 store_id: string; // Assuming UUID is represented as a string
 order_id: number;
 order_code: number;
 order_date: string;
 created_at: string;
 menu_name: string;
 quantity: number;
 table_name: string;
 status?: string;
};