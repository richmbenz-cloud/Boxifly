-- ============================================================
-- Fijar search_path en calculate_volumetric_weight (P3)
--
-- Resuelve el hallazgo `function_search_path_mutable` del Security
-- Advisor: la funcion no tenia un search_path fijo, lo que permite
-- secuestro de resolucion de objetos si se inyecta un schema malicioso.
--
-- Fix: SET search_path = '' (vacio). La funcion solo usa built-ins de
-- pg_catalog (split_part, casts numericos), que siempre se resuelven
-- aunque el search_path este vacio. Sin cambio de comportamiento.
-- ============================================================

alter function public.calculate_volumetric_weight(text) set search_path = '';
