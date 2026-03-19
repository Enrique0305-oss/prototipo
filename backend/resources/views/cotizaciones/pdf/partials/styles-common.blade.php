body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        /* ENCABEZADO CON LOGO */
        .logo-container {
            width: 100%;
            margin-bottom: 15px;
        }

        .logo-container table {
            width: 100%;
            border: none;
        }

        .logo-container td {
            border: none;
            padding: 0;
            vertical-align: top;
        }

        .logo-container .logo-qsci {
            width: 20%;
        }

        .logo-container .logo-qsci img {
            height: 70px;
            width: auto;
        }

        .logo-container .logo-encabezado {
            width: 80%;
            text-align: right;
        }
        
        .logo-container .logo-encabezado img {
            max-width: 100%;
            height: auto;
            display: inline-block;
        }
        
        .sub-title {
            background-color: #6CB52D;
            color: white;
            text-align: center;
            padding: 8px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 30px;
        }
        
        /* LÃNEA SEPARADORA */
        /* .separator {
            height: 3px;
            background-color: #2E4A7C;
            margin: 20px 0;
        } */
        
        /* NÃšMERO DE DOCUMENTO */
        .document-number {
            border: 2px solid #2E4A7C;
            padding: 12px;
            text-align: center;
            margin-bottom: 20px;
            background-color: #f8f9fa;
        }
        
        .document-number strong {
            color: #2E4A7C;
            font-size: 16px;
        }
        
        .document-number span {
            color: #6CB52D;
            font-size: 16px;
            font-weight: bold;
        }
        
        .document-date {
            color: #666;
            font-size: 11px;
            margin-top: 5px;
        }
        
        /* ESTILO PROFESIONAL TIPO CARTA */
        /* SECCIÃ“N DE DATOS DEL CLIENTE (ESTILO LISTA VERTICAL) */
        .intro-section {
            padding: 10px 40px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1a1a1a;
        }

        .client-info-list {
            margin-bottom: 30px;
        }

        .info-item {
            margin-bottom: 8px; /* Espaciado entre cada lÃ­nea */
        }

        .info-item .label {
            font-size: 13px;
            font-weight: bold;
            color: #000;
            display: block; /* Fuerza a que el valor vaya debajo o mantenga el bloque */
            text-transform: none;
        }

        .info-item .value {
            font-size: 14px;
            color: #2E4A7C; /* Color azul corporativo para los datos */
            font-weight: bold;
            display: block;
        }

        /* DISEÃ‘O DE LA PROPUESTA (SE MANTIENE) */
        .proposal-text {
            margin-top: 25px;
            font-size: 14.5px;
            line-height: 1.6;
            color: #333;
            text-align: justify;
        }

        .highlight-service {
            color: #2E4A7C;
            font-weight: bold;
        }

        /* DISEÃ‘O DE LA PROPUESTA COMERCIAL */
        .proposal-text {
            margin-top: 30px;
            font-size: 13.5px;
            line-height: 1.6;
            color: #333;
            text-align: justify;
        }

        .proposal-text p {
            margin-bottom: 15px;
        }

        .highlight-service {
            color: #2E4A7C;
            font-weight: bold;
        }

        .closing-phrase {
            margin-top: 25px;
            font-style: normal;
        }

        /* ENCABEZADOS DE PROPUESTA (PÃGINA 2) */
        .propuesta-numero {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #000;
            margin-top: 10px;
            margin-bottom: 5px;
            text-decoration: underline;
        }

        .propuesta-fecha {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin-bottom: 25px;
        }

        .seccion-titulo {
            font-size: 13px;
            font-weight: bold;
            color: #000;
            margin-top: 20px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .seccion-titulo-num {
            display: inline;
            margin-right: 15px;
        }

        .seccion-descripcion {
            font-size: 13px;
            line-height: 1.6;
            color: #333;
            text-align: justify;
            margin-bottom: 15px;
        }

        /* TABLA DE PRODUCTOS */
        .products-title {
            background-color: #2E4A7C;
            color: white;
            padding: 10px;
            font-weight: bold;
            font-size: 13px;
            text-align: center;
            margin-top: 30px;
        }
        
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            margin-top: 20px;
        }
        
        .products-table thead {
            background-color: #2E4A7C;
            color: white;
        }
        
        .products-table th {
            padding: 10px;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            border: 1px solid white;
        }
        
        .products-table td {
            padding: 10px;
            border: 1px solid #ddd;
            font-size: 12px;
        }
        
        .products-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        /* TOTALES */
        .totals-container {
            margin-top: 20px;
        }
        
        .totals-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals-table td {
            padding: 8px;
            font-size: 13px;
        }
        
        .totals-table .label {
            text-align: right;
            font-weight: bold;
            width: 70%;
            border-top: 1px solid #ddd;
            padding-right: 20px;
        }
        
        .totals-table .value {
            text-align: right;
            border: 1px solid #ddd;
            background-color: #f5f5f5;
            font-weight: bold;
            width: 30%;
        }
        
        .totals-table .total-row .label {
            background-color: #2E4A7C;
            color: white;
            border: 2px solid #2E4A7C;
            font-size: 15px;
        }
        
        .totals-table .total-row .value {
            background-color: #2E4A7C;
            color: white;
            border: 2px solid #2E4A7C;
            font-size: 15px;
        }
        
        /* CONDICIONES */
        .conditions {
            margin-top: 30px;
            border: 2px solid #2E4A7C;
            padding: 15px;
        }
        
        .conditions-title {
            background-color: #2E4A7C;
            color: white;
            padding: 8px;
            margin: -15px -15px 15px -15px;
            font-weight: bold;
            font-size: 13px;
            text-align: center;
        }
        
        .conditions-list {
            font-size: 11px;
            line-height: 1.8;
            margin-left: 20px;
        }
        
        .conditions-list li {
            margin-bottom: 8px;
            color: #555;
        }
        
        /* FOOTER */
        
        .footer .company-name {
            color: #2E4A7C;
            font-weight: bold;
            font-size: 12px;
        }
        
        .footer .tagline {
            color: #6CB52D;
            font-style: italic;
        }
        /* Estilos para la nueva tabla de pagos */
        .payment-section {
            margin-top: 25px;
            page-break-inside: avoid;
        }
        .payment-header-text {
            font-weight: bold;
            text-decoration: underline;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .payment-table {
            width: 90%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-left: 5%;
        }
        .payment-table td {
            border: 1px solid #000; 
            padding: 6px 10px;
            font-size: 11px;
        }
        .payment-table .label-cell {
            width: 45%;
            background-color: #ffffff;
        }

        /* ESTILO PARA EL EMISOR DEBAJO DE LA PROPUESTA */
        /* SECCIÃ“N DE FIRMA Y LOGOS */
        .issued-container {
            margin-top: 30px;
            padding: 0 10px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .issued-name {
            font-size: 15px;
            font-weight: bold;
            color: #000;
            margin-bottom: 2px;
        }

        .issued-position {
            font-size: 14px;
            color: #00b050; /* Color verde como en la imagen */
            font-weight: bold;
            margin-bottom: 15px;
        }

        .signature-logos {
            width: 100%;
            margin-top: 10px;
        }

        .signature-logos table {
            width: 100%;
            border: none;
        }

        .signature-logos td {
            border: none;
            padding: 0;
            vertical-align: middle;
            width: 50%; /* Divide el espacio en dos para las imÃ¡genes */
        }

        .img-signature {
            max-height: 70px; /* Ajusta segÃºn el tamaÃ±o de tus imÃ¡genes */
            width: auto;
        }  
        /* CLASE PARA FORZAR SALTO DE PÃGINA */
        .page-break {
            page-break-after: always;
        }
        /* ConfiguraciÃ³n para el pie de pÃ¡gina repetitivo */

        /* 2. EL FOOTER */
        footer {
            position: fixed; 
            bottom: -30px;
            left: 0px;
            right: 0px;
            height: 30px; 
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 8px;
        }

        .footer-link {
            color: #2E4A7C;
            text-decoration: none;
            font-weight: bold;
            font-size: 12px;
            font-family: sans-serif;
        }
        /* 1. HEADER FIJO - aparece en el Ã¡rea de margen superior */
        header {
            position: fixed;
            top: -85px;
            left: 0px;
            right: 0px;
            height: 75px;
        }


        @page {
            margin: 120px 40px 60px 40px; 
        }

        @page :first {
            margin-top: 5px;
        }


        .logo-small {
            height: 70px; 
            width: auto;
            display: block;
        }
        /* Estilos para el contenido que viene del editor Quill */
        .proposal-text ul, .proposal-text ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        .proposal-text li {
            list-style-type: disc; /* Para que salgan los puntitos en las listas */
        }

        /* Mejora la visualizaciÃ³n de tablas dentro del texto generado por Quill */
        .proposal-text table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
        }
        .proposal-text th,
        .proposal-text td {
            border: 1px solid #444;
            padding: 6px 8px;
        }
        .proposal-text td {
            vertical-align: top;
        }

        .contenido-desplazado {
            margin-left: 50px; /* Ajusta el valor a tu gusto */
            margin-right: 50px; /* Opcional: para equilibrar el ancho si es necesario */
        }

        /* IMPORTANTE: AsegÃºrate de que las tablas dentro de este div 
        no tengan un ancho fijo que rompa el margen */
        .contenido-desplazado .products-table {
            width: 100%; 
        }
