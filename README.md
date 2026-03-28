# PYME-Ledger - Sistema ERP Contable para Peru

Sistema de contabilidad profesional para micro y pequenas empresas (PYMES) basado en **Beancount** y el **Plan Contable General Empresarial (PCGE)** peruano.

## Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalacion y Requisitos](#instalacion-y-requisitos)
- [Monedas y Configuracion](#monedas-y-configuracion)
- [Catalogo de Cuentas PCGE](#catalogo-de-cuentas-pcge)
- [Patrones de Transacciones](#patrones-de-transacciones)
- [Comandos Utiles](#comandos-utiles)
- [Expansion Futura](#expansion-futura)

---

## Descripcion General

**PYME-Ledger** es un sistema de contabilidad de doble entrada basado en texto plano que implementa el estandar contable peruano PCGE. Diseñado para:

- **Bodegas y tiendas** al por menor
- **Empresas de servicios**
- **Pequenas manufactureras**
- **Cualquier negocio peruano** que requiera cumplimiento PCGE

### Caracteristicas Principales

- **Contabilidad de doble entrada** con partida doble
- **Monedas multiples**: PEN (Sol Peruano) y USD (Dolar Estadounidense)
- **Codigos PCGE de 5 digitos** para cumplimiento normativo
- **IGV (IVA Peruano)** del 18%% configurado
- **Control de versiones** de datos contables con Git
- **Reportes financieros** via Beancount

---

## Estructura del Proyecto

```
pyme-ledger/

|-- data/
|   |-- main.beancount          # Archivo principal del libro mayor
|   |   |-- Configuracion de opciones
|   |   |-- Monedas operativas (PEN, USD)
|   |   |-- Includes (accounts.bean)
|   |   |-- Transacciones de ejemplo
|   |
|   +-- core/
|       +-- accounts.bean       # Catalogo de cuentas PCGE

|-- README.md                   # Este archivo
|-- VERSION_MODIFICADA_PCG_EMPRESARIAL.md  # Referencia PCGE completa

|-- .agents/                    # Configuracion de agentes (no parte de contabilidad)
```

## Instalacion y Requisitos

### Requisitos

- **Python 3.8+**
- **Beancount** (motor de contabilidad)

### Instalacion

```bash
# Instalar Beancount
pip install beancount

# Verificar instalacion
bean-check --version
```

### Validar el Libro Mayor

```bash
# Validar sintaxis y balances
bean-check data/main.beancount

# Generar reporte de balances
bean-report data/main.beancount balancesheet

# Generar estado de resultados
bean-report data/main.beancount incomeStatement
```

## Monedas y Configuracion

### Monedas Soportadas

| Codigo | Moneda | Uso |
|--------|--------|-----|
| **PEN** | Sol Peruano | Moneda principal de operacion |
| **USD** | Dolar Estadounidense | Cuenta BCP en dolares |

### Configuracion en main.beancount

```lisp
option "operating_currency" "PEN"
option "operating_currency" "USD"
```

## Catalogo de Cuentas PCGE

### Activos (Elementos 1, 2, 3)

#### 10 - Efectivo y Equivalentes

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 10:1011 | Caja:Principal | PEN | Caja registradora principal |
| 10:1041 | CuentasCorrientes:BCP:Operativa | PEN, USD | Cuenta bancaria BCP operativa |

#### 12 - Cuentas por Cobrar Comerciales

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 12:1212 | Clientes:Emitidas:Varios | PEN | Cuentas por cobrar a clientes |

#### 20 - Mercaderias (Inventarios)

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 20:2011 | Mercaderias:Almacen:General | PEN | Inventario en almacen |

#### 33 - Inmuebles, Maquinaria y Equipo

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 33:3331 | Equipos:Explotacion:Maquinas | PEN | Maquinaria industrial |
| 33:3361 | Equipos:Computo:Hardware | PEN | Equipos de computo |

### Pasivos (Elemento 4)

#### 40 - Tributos y Aportes

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 40:4011 | IGV:Fiscal | PEN | IGV por pagar - SUNAT |
| 40:4017 | Renta:TerceraCategoria | PEN | Impuesto a la renta - 3ra categoria |

#### 42 - Cuentas por Pagar Comerciales

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 42:4212 | Proveedores:Emitidas:Varios | PEN | Cuentas por pagar a proveedores |

#### 45 - Obligaciones Financieras

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 45:4511 | Prestamos:Bancos:BCP | PEN | Prestamos bancarios BCP |

### Patrimonio (Elemento 5)

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 50:5011 | Capital:Social | PEN | Capital social de la empresa |
| 59:5911 | Resultados:Acumulados | PEN | Resultados acumulados |

### Gastos (Elemento 6)

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 60:6011 | Compras:Mercaderias | PEN | Compras de mercaderias |
| 62:6211 | Sueldos:Salarios | PEN | Planilla de sueldos |
| 63:6311 | Servicios:Alquileres | PEN | Alquileres de local |
| 63:6341 | Servicios:Mantenimiento | PEN | Servicios de mantenimiento |
| 69:6911 | CostoVentas:Mercaderias | PEN | Costo de ventas |

### Ingresos (Elemento 7)

| Codigo | Cuenta | Monedas | Proposito |
|--------|--------|---------|-----------|
| 70:7011 | Ventas:Mercaderias:Local | PEN | Ventas canal local |

## Patrones de Transacciones

### Ciclo Operativo PYME

```
COMPRA          ALMACEN           VENTA           CAJA
(60) ---------> (20) <---------> (70, 40) ------> (10)
     IGV(40)         Costo(69)
```

### Patron 1: Venta al Contado con IGV

```lisp
2026-03-28 * "Cliente Varios" "Venta de 10 unidades de mercaderia" #venta #pos
  documento: "FAC-001-0001"
  Assets:PE:10:1011:Caja:Principal                 118.00 PEN
  Income:PE:70:7011:Ventas:Mercaderias:Local      -100.00 PEN
  Liabilities:PE:40:4011:IGV:Fiscal                -18.00 PEN
```

**Desglose**:
- **Caja recibe**: 118 PEN (100 base + 18 IGV)
- **Ventas reconoce**: 100 PEN (base imponible)
- **IGV por pagar**: 18 PEN (18%% x 100)

### Patron 2: Reconocimiento de Costo de Ventas

```lisp
2026-03-28 * "Almacen" "Reconocimiento de Costo de Ventas" #costo
  Expenses:PE:69:6911:CostoVentas:Mercaderias       50.00 PEN
  Assets:PE:20:2011:Mercaderias:Almacen:General    -50.00 PEN
```

**Desglose**:
- **COGS reconoce**: 50 PEN (costo del producto vendido)
- **Inventario reduce**: 50 PEN (salida de mercaderia)

### Calculo de Margen Bruto

```
Precio Venta (sin IGV):     100.00 PEN
Costo de Venta:              50.00 PEN
-------------------------------
Margen Bruto:                50.00 PEN (50%%)

IGV Recaudado:               18.00 PEN
Total Cobrado al Cliente:   118.00 PEN
```

## Comandos Utiles

### Validacion y Reportes

```bash
# Validar libro mayor
bean-check data/main.beancount

# Balance General
bean-report data/main.beancount balancesheet

# Estado de Resultados
bean-report data/main.beancount incomeStatement

# Libro Mayor de una cuenta
bean-report data/main.beancount ledger Assets:PE:10:1011

# Diario de transacciones
bean-report data/main.beancount journal

# Balanza de Comprobacion
bean-report data/main.beancount trial

# Exportar a CSV
bean-report data/main.beancount balance --format csv > balances.csv
```

## Expansion Futura

### Archivos Sugeridos para Crear

1. **`data/core/commodities.bean`**: Definicion explicita de commodities
   ```lisp
   2026-01-01 commodity PEN
     name: "Sol Peruano"

   2026-01-01 commodity USD
     name: "US Dollar"
   ```

2. **`data/ledger/2026/00-apertura.bean`**: Saldos iniciales
   ```lisp
   ;; Apertura de ejercicio 2026

   2026-01-01 * "Apertura de Ejercicio"
     Assets:PE:10:1011:Caja:Principal           10,000.00 PEN
     Assets:PE:10:1041:CuentasCorrientes:BCP:Operativa   50,000.00 PEN
     Assets:PE:20:2011:Mercaderias:Almacen:General      30,000.00 PEN
     Equity:PE:50:5011:Capital:Social         -90,000.00 PEN
   ```

### Cuentas Adicionales Sugeridas

| Codigo | Cuenta | Elemento | Proposito |
|--------|--------|----------|-----------|
| 41 | Remuneraciones por Pagar | 4 | Planilla por pagar |
| 46 | Cuentas por Pagar Diversas | 4 | Otros acreedores |
| 62:622 | Gratificaciones | 6 | Gratificaciones |
| 62:623 | Vacaciones | 6 | Compensacion por tiempo de servicios |
| 63:632 | Servicios Publicos | 6 | Luz, agua, telefono |
| 63:633 | Servicios Bancarios | 6 | Comisiones bancarias |
| 94 | Gastos Administrativos | 9 | Costeo por funcion |
| 95 | Gastos de Venta | 9 | Costeo por funcion |

## Estandar PCGE

El Plan Contable General Empresarial (PCGE) es el estandar contable oficial del Peru, alineado con NIIF (Normas Internacionales de Informacion Financiera).

### Estructura de Codigos (5 Digitos)

```
Elemento (1 digito) | Cuenta (1 digito) | Subcuenta (1 digito) | Divisionaria (1 digito) | Subdivisionaria (1 digito)
```

### Clasificacion por Elemento

| Elemento | Descripcion | Tipo |
|----------|-------------|------|
| 1 | Activo Disponible y Exigible | Activo |
| 2 | Activo Realizable | Activo |
| 3 | Activo Inmovilizado | Activo |
| 4 | Pasivo | Pasivo |
| 5 | Patrimonio Neto | Patrimonio |
| 6 | Gastos por Naturaleza | Gasto |
| 7 | Ingresos | Ingreso |
| 8 | Saldos Intermediarios de Gestion | Resultado |
| 9 | Costos de Produccion | Costo |
| 0 | Cuentas de Orden | Orden |

---

*Generado para Mi Bodega SAC - Sistema ERP*
*Basado en Beancount y PCGE Peruano*
