SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict psOP7ZD0uGbCirsUU9CnWhQXeqMTDTjFewF3dpiBxHxQbhacAwkZw9CVRVvHYIb

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', 'authenticated', 'authenticated', 'marco.decormis@friktek.com', '$2a$10$M/5BBm58h22/FxV.Vh9/g.Go5mQGTY4.ZM0A2JoV.XzWycpB9anqu', '2025-11-12 20:22:01.815629+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-12 20:22:51.049196+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-12 20:22:01.782714+00', '2025-11-13 01:18:41.660588+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '22548472-e2f7-47dd-bf82-af3727d3c43b', 'authenticated', 'authenticated', 'nesdufrik@gmail.com', '$2a$10$4u/whctVAUvjg7vpMpZ1hu20hXwVqGu94b1NJLnqgVC1JgLls639K', '2025-11-06 19:39:36.865231+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-12 19:58:34.945885+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-06 19:39:36.836895+00', '2025-11-12 19:58:34.957595+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('22548472-e2f7-47dd-bf82-af3727d3c43b', '22548472-e2f7-47dd-bf82-af3727d3c43b', '{"sub": "22548472-e2f7-47dd-bf82-af3727d3c43b", "email": "nesdufrik@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-06 19:39:36.855319+00', '2025-11-06 19:39:36.85538+00', '2025-11-06 19:39:36.85538+00', '022c77c3-1a32-46ab-9ade-fc0d630a8e39'),
	('dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', '{"sub": "dccd6ab3-33fc-47dd-bfe9-49b286c7acc9", "email": "marco.decormis@friktek.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-12 20:22:01.805389+00', '2025-11-12 20:22:01.80599+00', '2025-11-12 20:22:01.80599+00', 'c216b8be-7b2f-40d8-b667-00434d711530');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('b72db027-f2e1-4901-8184-5b05be27f065', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', '2025-11-12 20:22:51.049319+00', '2025-11-13 01:18:41.668461+00', NULL, 'aal1', NULL, '2025-11-13 01:18:41.667174', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '181.115.171.173', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('b72db027-f2e1-4901-8184-5b05be27f065', '2025-11-12 20:22:51.06072+00', '2025-11-12 20:22:51.06072+00', 'password', '80403472-3315-46e0-938f-f6a58ac4530f');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 65, 'sdqst4mjwh5s', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', true, '2025-11-12 20:22:51.055112+00', '2025-11-12 21:21:13.444716+00', NULL, 'b72db027-f2e1-4901-8184-5b05be27f065'),
	('00000000-0000-0000-0000-000000000000', 66, 'f6rx2v2qwjcc', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', true, '2025-11-12 21:21:13.468553+00', '2025-11-12 22:45:48.796098+00', 'sdqst4mjwh5s', 'b72db027-f2e1-4901-8184-5b05be27f065'),
	('00000000-0000-0000-0000-000000000000', 67, 'kl7nk7rhnlit', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', true, '2025-11-12 22:45:48.810087+00', '2025-11-12 23:49:17.449003+00', 'f6rx2v2qwjcc', 'b72db027-f2e1-4901-8184-5b05be27f065'),
	('00000000-0000-0000-0000-000000000000', 68, 'golfah45c3ze', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', true, '2025-11-12 23:49:17.461312+00', '2025-11-13 01:18:41.641277+00', 'kl7nk7rhnlit', 'b72db027-f2e1-4901-8184-5b05be27f065'),
	('00000000-0000-0000-0000-000000000000', 69, 'qu743rcrn2xy', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', false, '2025-11-13 01:18:41.654229+00', '2025-11-13 01:18:41.654229+00', 'golfah45c3ze', 'b72db027-f2e1-4901-8184-5b05be27f065');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("profile_id", "updated_at", "username", "full_name", "avatar_url", "website") VALUES
	('22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, NULL, NULL, NULL),
	('dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."auditoria" ("id", "tabla_nombre", "registro_id", "accion", "valores_anteriores", "valores_nuevos", "usuario_id", "ip_address", "user_agent", "timestamp") VALUES
	('519406c8-7c75-4593-86e3-38ba14a0bfbf', 'ubicaciones', 19, 'INSERT', NULL, '{"ciudad": "Serranito", "ubicacion_id": 19}', '22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, '2025-11-12 20:17:02.267063+00'),
	('7eb90bdc-1613-4729-9e51-be0fdbf97257', 'ubicaciones', 19, 'DELETE', '{"ciudad": "Serranito", "ubicacion_id": 19}', NULL, '22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, '2025-11-12 20:17:53.685321+00'),
	('f51c2b4c-92bb-4e31-8df7-02aa23b090a4', 'ubicaciones', 13, 'DELETE', '{"ciudad": "La Paz", "ubicacion_id": 13}', NULL, '22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, '2025-11-12 20:17:56.191391+00'),
	('a7a626eb-0529-42d2-96e4-4bb0a2c0c3b2', 'ubicaciones', 12, 'DELETE', '{"ciudad": "Oruro", "ubicacion_id": 12}', NULL, '22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, '2025-11-12 20:17:58.473306+00'),
	('3cbe96a7-2b45-4474-aefb-839fd5c2d4c1', 'ubicaciones', 20, 'INSERT', NULL, '{"ciudad": "Oruro", "ubicacion_id": 20}', '22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, '2025-11-12 20:19:13.066742+00'),
	('b35ed844-f849-4ee9-9ad7-9497453130c3', 'ubicaciones', 20, 'UPDATE', '{"ciudad": "Oruro", "ubicacion_id": 20}', '{"ciudad": "Serrano", "ubicacion_id": 20}', '22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, '2025-11-12 20:19:56.617547+00'),
	('9effa16b-2a74-4f84-babb-bedb47872996', 'ubicaciones', 21, 'INSERT', NULL, '{"ciudad": "La Paz", "ubicacion_id": 21}', '22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, '2025-11-12 20:21:27.573587+00'),
	('fe6fa841-c450-4087-a5fd-1b6c3ce140b4', 'ubicaciones', 20, 'UPDATE', '{"ciudad": "Serrano", "ubicacion_id": 20}', '{"ciudad": "Oruro", "ubicacion_id": 20}', '22548472-e2f7-47dd-bf82-af3727d3c43b', NULL, NULL, '2025-11-12 20:23:06.784451+00'),
	('9266aeda-8520-46bf-a7f1-a7691921ca8a', 'ubicaciones', 20, 'UPDATE', '{"ciudad": "Oruro", "ubicacion_id": 20}', '{"ciudad": "Oruro", "ubicacion_id": 20}', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', NULL, NULL, '2025-11-12 20:24:07.607977+00'),
	('8b098d27-4ae7-4f0f-a720-812099944d92', 'ubicaciones', 20, 'DELETE', '{"ciudad": "Oruro", "ubicacion_id": 20}', NULL, 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', NULL, NULL, '2025-11-12 23:49:24.912749+00'),
	('f93fcfb9-6442-42c8-bedc-2470123f56b1', 'ubicaciones', 21, 'DELETE', '{"ciudad": "La Paz", "ubicacion_id": 21}', NULL, 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', NULL, NULL, '2025-11-12 23:49:26.94385+00'),
	('9754d3ed-8df0-4042-8173-dbf506cb0455', 'ubicaciones', 22, 'INSERT', NULL, '{"ciudad": "Oruro", "ubicacion_id": 22}', 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', NULL, NULL, '2025-11-12 23:49:32.142401+00'),
	('e1057b51-a014-416b-ab1b-5eb6a2840b9d', 'ubicaciones', 22, 'DELETE', '{"ciudad": "Oruro", "ubicacion_id": 22}', NULL, 'dccd6ab3-33fc-47dd-bfe9-49b286c7acc9', NULL, NULL, '2025-11-12 23:49:36.401773+00');


--
-- Data for Name: categoriasservicio; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: hojasdeprecios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."clientes" ("cliente_id", "nombre_completo", "email", "telefono", "empresa", "fecha_creacion", "hoja_id") OVERRIDING SYSTEM VALUE VALUES
	(1, 'marco antonio decormis pinto', 'nesdufrik@gmail.com', '+59178699626', 'friktek', '2025-11-06 04:02:58.671753', NULL);


--
-- Data for Name: paquetes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."ubicaciones" ("ubicacion_id", "ciudad") OVERRIDING SYSTEM VALUE VALUES
	(1, 'Sucre'),
	(2, 'Potosi'),
	(3, 'Uyuni');


--
-- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: componentespaquete; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: cotizaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: hoteles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tiposhabitacion; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: itemscotizacion; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: precioshabitacion; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: preciosservicio; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('avatars', 'avatars', NULL, '2025-11-06 19:38:09.111221+00', '2025-11-06 19:38:09.111221+00', false, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 69, true);


--
-- Name: categoriasservicio_categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."categoriasservicio_categoria_id_seq"', 1, false);


--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."clientes_cliente_id_seq"', 1, true);


--
-- Name: cotizaciones_cotizacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."cotizaciones_cotizacion_id_seq"', 1, false);


--
-- Name: hojasdeprecios_hoja_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."hojasdeprecios_hoja_id_seq"', 1, false);


--
-- Name: hoteles_hotel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."hoteles_hotel_id_seq"', 1, false);


--
-- Name: itemscotizacion_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."itemscotizacion_item_id_seq"', 1, false);


--
-- Name: paquetes_paquete_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."paquetes_paquete_id_seq"', 1, false);


--
-- Name: precioshabitacion_precio_hab_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."precioshabitacion_precio_hab_id_seq"', 1, false);


--
-- Name: preciosservicio_precio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."preciosservicio_precio_id_seq"', 1, false);


--
-- Name: servicios_servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."servicios_servicio_id_seq"', 1, false);


--
-- Name: tiposhabitacion_habitacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."tiposhabitacion_habitacion_id_seq"', 1, false);


--
-- Name: ubicaciones_ubicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."ubicaciones_ubicacion_id_seq"', 22, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict psOP7ZD0uGbCirsUU9CnWhQXeqMTDTjFewF3dpiBxHxQbhacAwkZw9CVRVvHYIb

RESET ALL;
