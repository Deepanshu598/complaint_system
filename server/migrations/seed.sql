CREATE TABLE IF NOT EXISTS roles (role_id serial primary key, role_name varchar(50) UNIQUE);
INSERT INTO roles (role_name) VALUES ('superadmin') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('approver') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('reviewer') ON CONFLICT DO NOTHING;
INSERT INTO roles (role_name) VALUES ('user') ON CONFLICT DO NOTHING;
