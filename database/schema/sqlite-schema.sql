CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE IF NOT EXISTS "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE IF NOT EXISTS "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" text not null,
  "queue" text not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE IF NOT EXISTS "permissions"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "guard_name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "permissions_name_guard_name_unique" on "permissions"(
  "name",
  "guard_name"
);
CREATE TABLE IF NOT EXISTS "roles"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "guard_name" varchar not null,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "roles_name_guard_name_unique" on "roles"(
  "name",
  "guard_name"
);
CREATE TABLE IF NOT EXISTS "model_has_permissions"(
  "permission_id" integer not null,
  "model_type" varchar not null,
  "model_id" integer not null,
  foreign key("permission_id") references "permissions"("id") on delete cascade,
  primary key("permission_id", "model_id", "model_type")
);
CREATE INDEX "model_has_permissions_model_id_model_type_index" on "model_has_permissions"(
  "model_id",
  "model_type"
);
CREATE TABLE IF NOT EXISTS "model_has_roles"(
  "role_id" integer not null,
  "model_type" varchar not null,
  "model_id" integer not null,
  foreign key("role_id") references "roles"("id") on delete cascade,
  primary key("role_id", "model_id", "model_type")
);
CREATE INDEX "model_has_roles_model_id_model_type_index" on "model_has_roles"(
  "model_id",
  "model_type"
);
CREATE TABLE IF NOT EXISTS "role_has_permissions"(
  "permission_id" integer not null,
  "role_id" integer not null,
  foreign key("permission_id") references "permissions"("id") on delete cascade,
  foreign key("role_id") references "roles"("id") on delete cascade,
  primary key("permission_id", "role_id")
);
CREATE TABLE IF NOT EXISTS "customers"(
  "id" integer primary key autoincrement not null,
  "username" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "phone" varchar,
  "is_active" tinyint(1) not null default '1',
  "referral_code" varchar not null,
  "referred_by" integer,
  "kyc_verified_at" datetime,
  "kyc_data" text,
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("referred_by") references "customers"("id") on delete set null
);
CREATE INDEX "customers_referral_code_index" on "customers"("referral_code");
CREATE UNIQUE INDEX "customers_username_unique" on "customers"("username");
CREATE UNIQUE INDEX "customers_email_unique" on "customers"("email");
CREATE UNIQUE INDEX "customers_referral_code_unique" on "customers"(
  "referral_code"
);
CREATE TABLE IF NOT EXISTS "customer_balances"(
  "id" integer primary key autoincrement not null,
  "customer_id" integer not null,
  "balance" numeric not null default '0',
  "locked_balance" numeric not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("customer_id") references "customers"("id") on delete cascade
);
CREATE UNIQUE INDEX "customer_balances_customer_id_unique" on "customer_balances"(
  "customer_id"
);
CREATE TABLE IF NOT EXISTS "intermediate_transactions"(
  "id" integer primary key autoincrement not null,
  "transaction_code" varchar not null,
  "buyer_id" integer not null,
  "seller_id" integer not null,
  "description" text not null,
  "amount" numeric not null,
  "fee" numeric not null default '0',
  "duration_hours" integer not null,
  "status" varchar check("status" in('pending', 'confirmed', 'seller_sent', 'buyer_received', 'completed', 'disputed', 'cancelled', 'expired')) not null default 'pending',
  "buyer_notes" text,
  "seller_notes" text,
  "admin_notes" text,
  "confirmed_at" datetime,
  "seller_sent_at" datetime,
  "buyer_received_at" datetime,
  "expires_at" datetime not null,
  "completed_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("buyer_id") references "customers"("id") on delete cascade,
  foreign key("seller_id") references "customers"("id") on delete cascade
);
CREATE INDEX "intermediate_transactions_status_expires_at_index" on "intermediate_transactions"(
  "status",
  "expires_at"
);
CREATE INDEX "intermediate_transactions_transaction_code_index" on "intermediate_transactions"(
  "transaction_code"
);
CREATE UNIQUE INDEX "intermediate_transactions_transaction_code_unique" on "intermediate_transactions"(
  "transaction_code"
);
CREATE TABLE IF NOT EXISTS "transaction_chats"(
  "id" integer primary key autoincrement not null,
  "transaction_id" integer not null,
  "transaction_type" varchar not null,
  "sender_id" integer not null,
  "message" text not null,
  "images" text,
  "is_deleted" tinyint(1) not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("sender_id") references "customers"("id") on delete cascade
);
CREATE INDEX "transaction_chats_transaction_id_transaction_type_index" on "transaction_chats"(
  "transaction_id",
  "transaction_type"
);
CREATE INDEX "transaction_chats_created_at_index" on "transaction_chats"(
  "created_at"
);
CREATE TABLE IF NOT EXISTS "store_transactions"(
  "id" integer primary key autoincrement not null,
  "transaction_code" varchar not null,
  "buyer_id" integer not null,
  "seller_id" integer not null,
  "product_id" integer not null,
  "amount" numeric not null,
  "fee" numeric not null default '0',
  "status" varchar check("status" in('processing', 'completed', 'disputed', 'cancelled')) not null default 'processing',
  "completed_at" datetime,
  "auto_complete_at" datetime not null,
  "buyer_early_complete" tinyint(1) not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("buyer_id") references "customers"("id") on delete cascade,
  foreign key("seller_id") references "customers"("id") on delete cascade,
  foreign key("product_id") references "store_products"("id") on delete cascade
);
CREATE INDEX "store_transactions_status_auto_complete_at_index" on "store_transactions"(
  "status",
  "auto_complete_at"
);
CREATE INDEX "store_transactions_transaction_code_index" on "store_transactions"(
  "transaction_code"
);
CREATE UNIQUE INDEX "store_transactions_transaction_code_unique" on "store_transactions"(
  "transaction_code"
);
CREATE TABLE IF NOT EXISTS "referrals"(
  "id" integer primary key autoincrement not null,
  "referrer_id" integer not null,
  "referred_id" integer not null,
  "total_points_earned" numeric not null default '0',
  "successful_transactions" integer not null default '0',
  "first_transaction_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("referrer_id") references "customers"("id") on delete cascade,
  foreign key("referred_id") references "customers"("id") on delete cascade
);
CREATE UNIQUE INDEX "referrals_referrer_id_referred_id_unique" on "referrals"(
  "referrer_id",
  "referred_id"
);
CREATE INDEX "referrals_referrer_id_index" on "referrals"("referrer_id");
CREATE TABLE IF NOT EXISTS "transaction_fees"(
  "id" integer primary key autoincrement not null,
  "min_amount" numeric not null,
  "max_amount" numeric,
  "fee_amount" numeric not null,
  "fee_percentage" numeric not null default '0',
  "daily_fee_percentage" numeric not null default '20',
  "points_reward" integer not null,
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "transaction_fees_min_amount_max_amount_is_active_index" on "transaction_fees"(
  "min_amount",
  "max_amount",
  "is_active"
);
CREATE TABLE IF NOT EXISTS "system_settings"(
  "id" integer primary key autoincrement not null,
  "key" varchar not null,
  "value" text not null,
  "type" varchar not null default 'string',
  "description" text,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "system_settings_key_index" on "system_settings"("key");
CREATE UNIQUE INDEX "system_settings_key_unique" on "system_settings"("key");
CREATE TABLE IF NOT EXISTS "daily_chat_limits"(
  "id" integer primary key autoincrement not null,
  "customer_id" integer not null,
  "date" date not null,
  "general_chat_count" integer not null default '0',
  "transaction_chat_images" integer not null default '0',
  "last_general_chat_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("customer_id") references "customers"("id") on delete cascade
);
CREATE UNIQUE INDEX "daily_chat_limits_customer_id_date_unique" on "daily_chat_limits"(
  "customer_id",
  "date"
);
CREATE INDEX "daily_chat_limits_date_index" on "daily_chat_limits"("date");
CREATE TABLE IF NOT EXISTS "customer_points"(
  "id" integer primary key autoincrement not null,
  "customer_id" integer not null,
  "points" integer not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("customer_id") references customers("id") on delete cascade on update no action
);
CREATE UNIQUE INDEX "customer_points_customer_id_unique" on "customer_points"(
  "customer_id"
);
CREATE INDEX "customers_is_active_index" on "customers"("is_active");
CREATE TABLE IF NOT EXISTS "personal_stores"(
  "id" integer primary key autoincrement not null,
  "owner_id" integer not null,
  "store_name" varchar not null,
  "description" text,
  "avatar" varchar,
  "is_active" tinyint(1) not null default('1'),
  "is_locked" tinyint(1) not null default('0'),
  "locked_by" integer,
  "locked_at" datetime,
  "lock_reason" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("owner_id") references customers("id") on delete cascade on update no action,
  foreign key("locked_by") references "users"("id") on delete set null
);
CREATE INDEX "personal_stores_is_active_is_locked_index" on "personal_stores"(
  "is_active",
  "is_locked"
);
CREATE UNIQUE INDEX "personal_stores_owner_id_unique" on "personal_stores"(
  "owner_id"
);
CREATE TABLE IF NOT EXISTS "store_products"(
  "id" integer primary key autoincrement not null,
  "store_id" integer not null,
  "name" varchar not null,
  "description" text not null,
  "images" text,
  "price" numeric not null,
  "content" text not null,
  "is_sold" tinyint(1) not null default('0'),
  "is_active" tinyint(1) not null default('1'),
  "is_deleted" tinyint(1) not null default('0'),
  "deleted_by" integer,
  "deleted_at" datetime,
  "delete_reason" text,
  "created_at" datetime,
  "updated_at" datetime,
  "sold_at" datetime,
  foreign key("store_id") references personal_stores("id") on delete cascade on update no action,
  foreign key("deleted_by") references "users"("id") on delete set null
);
CREATE INDEX "store_products_price_index" on "store_products"("price");
CREATE INDEX "store_products_store_id_is_sold_is_active_is_deleted_index" on "store_products"(
  "store_id",
  "is_sold",
  "is_active",
  "is_deleted"
);
CREATE TABLE IF NOT EXISTS "general_chats"(
  "id" integer primary key autoincrement not null,
  "sender_id" integer not null,
  "message" text not null,
  "attached_product_id" integer,
  "is_deleted" tinyint(1) not null default('0'),
  "deleted_by" integer,
  "deleted_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("attached_product_id") references store_products("id") on delete set null on update no action,
  foreign key("sender_id") references customers("id") on delete cascade on update no action,
  foreign key("deleted_by") references "users"("id") on delete set null
);
CREATE INDEX "general_chats_created_at_is_deleted_index" on "general_chats"(
  "created_at",
  "is_deleted"
);
CREATE TABLE IF NOT EXISTS "disputes"(
  "id" integer primary key autoincrement not null,
  "transaction_type" varchar not null,
  "transaction_id" integer not null,
  "created_by" integer not null,
  "reason" text not null,
  "evidence" text,
  "status" varchar not null default('pending'),
  "assigned_to" integer,
  "admin_notes" text,
  "result" varchar,
  "resolved_at" datetime,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("created_by") references customers("id") on delete cascade on update no action,
  foreign key("assigned_to") references "users"("id") on delete set null
);
CREATE INDEX "disputes_status_assigned_to_index" on "disputes"(
  "status",
  "assigned_to"
);
CREATE INDEX "disputes_transaction_type_transaction_id_index" on "disputes"(
  "transaction_type",
  "transaction_id"
);
CREATE TABLE IF NOT EXISTS "point_transactions"(
  "id" integer primary key autoincrement not null,
  "customer_id" integer not null,
  "points" integer not null,
  "type" varchar check("type" in('earned', 'earn', 'referral_bonus', 'sent', 'received', 'exchanged', 'spend', 'transfer', 'admin_adjust')) not null,
  "source" varchar not null,
  "description" text not null,
  "target_customer_id" integer,
  "admin_id" integer,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("customer_id") references customers("id") on delete cascade on update no action,
  foreign key("target_customer_id") references customers("id") on delete set null on update no action,
  foreign key("admin_id") references customers("id") on delete set null on update no action
);
CREATE INDEX "point_transactions_created_at_index" on "point_transactions"(
  "created_at"
);
CREATE INDEX "point_transactions_customer_id_type_index" on "point_transactions"(
  "customer_id",
  "type"
);

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO migrations VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO migrations VALUES(4,'2025_06_25_065457_create_permission_tables',1);
INSERT INTO migrations VALUES(22,'2025_06_25_081953_create_customers_table',2);
INSERT INTO migrations VALUES(23,'2025_06_25_082025_create_customer_balances_table',2);
INSERT INTO migrations VALUES(24,'2025_06_25_082037_create_intermediate_transactions_table',2);
INSERT INTO migrations VALUES(25,'2025_06_25_082047_create_transaction_chats_table',2);
INSERT INTO migrations VALUES(26,'2025_06_25_082058_create_general_chats_table',2);
INSERT INTO migrations VALUES(27,'2025_06_25_082106_create_personal_stores_table',2);
INSERT INTO migrations VALUES(28,'2025_06_25_082128_create_store_products_table',2);
INSERT INTO migrations VALUES(29,'2025_06_25_082141_create_store_transactions_table',2);
INSERT INTO migrations VALUES(30,'2025_06_25_082151_create_customer_points_table',2);
INSERT INTO migrations VALUES(31,'2025_06_25_082202_create_point_transactions_table',2);
INSERT INTO migrations VALUES(32,'2025_06_25_082211_create_referrals_table',2);
INSERT INTO migrations VALUES(33,'2025_06_25_082222_create_disputes_table',2);
INSERT INTO migrations VALUES(34,'2025_06_25_082230_create_transaction_fees_table',2);
INSERT INTO migrations VALUES(35,'2025_06_25_082629_create_system_settings_table',2);
INSERT INTO migrations VALUES(36,'2025_06_25_082644_create_daily_chat_limits_table',2);
INSERT INTO migrations VALUES(37,'2025_06_25_082656_seed_transaction_fees_data',2);
INSERT INTO migrations VALUES(38,'2025_06_25_082851_add_foreign_key_to_general_chats_table',2);
INSERT INTO migrations VALUES(39,'2025_06_25_125550_fix_point_transactions_amount_column',3);
INSERT INTO migrations VALUES(40,'2025_06_25_125818_fix_customer_points_column',3);
INSERT INTO migrations VALUES(41,'2025_06_25_130115_update_disputes_table_fields',3);
INSERT INTO migrations VALUES(42,'2025_06_25_130421_add_sold_at_to_store_products_table',3);
INSERT INTO migrations VALUES(43,'2025_06_25_131229_remove_role_from_customers_table',4);
INSERT INTO migrations VALUES(44,'2025_06_25_131524_update_moderation_fields_to_use_users_table',4);
INSERT INTO migrations VALUES(45,'2025_06_26_000001_update_point_transactions_enum_values',5);
