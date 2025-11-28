/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pulsera_gps`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas`
--

CREATE TABLE `alertas` (
  `id_alerta` int(11) NOT NULL,
  `id_nino` int(11) NOT NULL,
  `id_zona` int(11) DEFAULT NULL,
  `tipo_alerta` enum('salida_zona_segura','bateria_baja') NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--
-- Estructura de tabla para la tabla `ninos`
--

CREATE TABLE `ninos` (
  `id_nino` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `id_pulsera` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--
-- Estructura de tabla para la tabla `pulsera`
--

CREATE TABLE `pulsera` (
  `id_pulsera` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `id_nino` int(11) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id_ubicacion` int(11) NOT NULL,
  `id_nino` int(11) NOT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `fecha_hora` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--
-- Disparadores `ubicaciones`
--
DELIMITER $$
CREATE TRIGGER `ajustar_hora_insert` BEFORE INSERT ON `ubicaciones` FOR EACH ROW BEGIN
    -- Ajusta timestampUTC y fecha_hora restando 4 horas
    SET NEW.fecha_hora = NEW.fecha_hora - INTERVAL 4 HOUR;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `zonas_seguras`
--

CREATE TABLE `zonas_seguras` (
  `id_zona` int(11) NOT NULL,
  `id_nino` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombre_zona` varchar(100) NOT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `radio_metros` int(11) NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `alerta_enviada` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indices de la tabla `alertas`
--
ALTER TABLE `alertas`
  ADD PRIMARY KEY (`id_alerta`),
  ADD KEY `id_nino` (`id_nino`),
  ADD KEY `alertas_ibfk_2` (`id_zona`);

--
-- Indices de la tabla `ninos`
--
ALTER TABLE `ninos`
  ADD PRIMARY KEY (`id_nino`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `fk_ninos_pulsera` (`id_pulsera`);

--
-- Indices de la tabla `pulsera`
--
ALTER TABLE `pulsera`
  ADD PRIMARY KEY (`id_pulsera`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `id_nino` (`id_nino`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id_ubicacion`),
  ADD KEY `id_nino` (`id_nino`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `zonas_seguras`
--
ALTER TABLE `zonas_seguras`
  ADD PRIMARY KEY (`id_zona`),
  ADD KEY `id_nino` (`id_nino`),
  ADD KEY `id_usuario` (`id_usuario`);
--
-- AUTO_INCREMENT de la tabla `alertas`
--
ALTER TABLE `alertas`
  MODIFY `id_alerta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `ninos`
--
ALTER TABLE `ninos`
  MODIFY `id_nino` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `pulsera`
--
ALTER TABLE `pulsera`
  MODIFY `id_pulsera` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id_ubicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1469;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `zonas_seguras`
--
ALTER TABLE `zonas_seguras`
  MODIFY `id_zona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Filtros para la tabla `alertas`
--
ALTER TABLE `alertas`
  ADD CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`id_nino`) REFERENCES `ninos` (`id_nino`) ON DELETE CASCADE,
  ADD CONSTRAINT `alertas_ibfk_2` FOREIGN KEY (`id_zona`) REFERENCES `zonas_seguras` (`id_zona`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ninos`
--
ALTER TABLE `ninos`
  ADD CONSTRAINT `fk_ninos_pulsera` FOREIGN KEY (`id_pulsera`) REFERENCES `pulsera` (`id_pulsera`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ninos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pulsera`
--
ALTER TABLE `pulsera`
  ADD CONSTRAINT `pulsera_ibfk_1` FOREIGN KEY (`id_nino`) REFERENCES `ninos` (`id_nino`) ON DELETE SET NULL;

--
-- Filtros para la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD CONSTRAINT `ubicaciones_ibfk_1` FOREIGN KEY (`id_nino`) REFERENCES `ninos` (`id_nino`) ON DELETE CASCADE;

--
-- Filtros para la tabla `zonas_seguras`
--
ALTER TABLE `zonas_seguras`
  ADD CONSTRAINT `zonas_seguras_ibfk_1` FOREIGN KEY (`id_nino`) REFERENCES `ninos` (`id_nino`) ON DELETE CASCADE,
  ADD CONSTRAINT `zonas_seguras_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
