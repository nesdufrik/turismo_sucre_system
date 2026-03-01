import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import nodemailer from 'npm:nodemailer'

const SMTP_PASS = Deno.env.get('SMTP_PASS')
const APP_URL = Deno.env.get('APP_URL') || 'https://tu-app.com'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
	// Manejar CORS
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders })
	}

	try {
		const payload = await req.json()
		const { record } = payload

		// El 'record' viene del Webhook de la tabla user_invites
		const { email, token, role } = record
		const inviteLink = `${APP_URL}/register-invite?token=${token}`

		const htmlContent = `
			<!DOCTYPE html>
			<html lang="es">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<style>
					body {
						font-family: 'Inter', system-ui, -apple-system, sans-serif;
						background-color: #f8fafc;
						margin: 0;
						padding: 0;
						-webkit-font-smoothing: antialiased;
					}
					.wrapper {
						width: 100%;
						background-color: #f8fafc;
						padding: 40px 0;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						background-color: #ffffff;
						border-radius: 16px;
						overflow: hidden;
						box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
						border: 1px solid #e2e8f0;
					}
					.header {
						background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
						padding: 40px 20px;
						text-align: center;
					}
					.logo-text {
						color: #ffffff;
						margin: 0;
						font-size: 24px;
						font-weight: 800;
						letter-spacing: -0.025em;
						text-transform: uppercase;
					}
					.logo-text span {
						color: #ef4444;
					}
					.content {
						padding: 48px 40px;
						text-align: center;
					}
					.content h2 {
						color: #0f172a;
						font-size: 24px;
						font-weight: 700;
						margin-top: 0;
						margin-bottom: 16px;
					}
					.role-badge {
						display: inline-block;
						background-color: #eff6ff;
						color: #2563eb;
						padding: 6px 16px;
						border-radius: 9999px;
						font-size: 14px;
						font-weight: 600;
						margin-bottom: 24px;
						text-transform: uppercase;
						letter-spacing: 0.05em;
					}
					.content p {
						color: #475569;
						font-size: 16px;
						line-height: 1.6;
						margin-bottom: 32px;
					}
					.button-container {
						margin: 32px 0;
					}
					.button {
						background-color: #ef4444;
						color: #ffffff !important;
						padding: 16px 36px;
						border-radius: 12px;
						text-decoration: none;
						font-weight: 600;
						font-size: 16px;
						display: inline-block;
						box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
					}
					.link-alt {
						font-size: 12px;
						color: #94a3b8;
						word-break: break-all;
						margin-top: 32px;
					}
					.footer {
						padding: 32px 20px;
						text-align: center;
						background-color: #f1f5f9;
						border-top: 1px solid #e2e8f0;
					}
					.footer p {
						color: #64748b;
						font-size: 14px;
						margin: 0;
					}
				</style>
			</head>
			<body>
				<div class="wrapper">
					<div class="container">
						<div class="header">
							<div class="logo-text">TURISMO <span>SUCRE</span></div>
						</div>
						<div class="content">
							<h2>¡Bienvenido al Equipo!</h2>
							<p>Has sido invitado a unirte a la plataforma de gestión de <strong>Turismo Sucre</strong>.</p>
							
							<div style="margin-bottom: 10px; font-size: 14px; color: #64748b;">Rol asignado:</div>
							<div class="role-badge">${role}</div>

							<p>Para completar tu registro y establecer tu contraseña, haz clic en el siguiente botón:</p>
							
							<div class="button-container">
								<a href="${inviteLink}" class="button">Configurar mi cuenta</a>
							</div>
							
							<p style="font-size: 14px;">Este enlace de activación expirará en 7 días por motivos de seguridad.</p>
							
							<div class="link-alt">
								Si el botón no funciona, copia este enlace en tu navegador: <br />
								<span style="color: #6366f1;">${inviteLink}</span>
							</div>
						</div>
						<div class="footer">
							<p>&copy; 2026 Turismo Sucre. Sucre, Bolivia.</p>
							<p style="margin-top: 8px; font-size: 12px;">Gestión de Operaciones Turísticas.</p>
						</div>
					</div>
				</div>
			</body>
			</html>
    	`
		
		if (!SMTP_PASS) {
			console.log("Modo Simulación: SMTP_PASS no configurado.")
			return new Response(JSON.stringify({ 
				message: 'Simulation Mode: Email generated successfully (No SMTP_PASS)', 
				html: htmlContent 
			}), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 200
			})
		}

		const transporter = nodemailer.createTransport({
			host: 'mail.turismosucre.com.bo',
			port: 465,
			secure: true,
			auth: {
				user: 'no-reply@turismosucre.com.bo',
				pass: SMTP_PASS,
			},
		})

		const info = await transporter.sendMail({
			from: '"Turismo Sucre" <no-reply@turismosucre.com.bo>',
			to: email,
			subject: 'Invitación al Sistema - Turismo Sucre',
			html: htmlContent,
		})

		return new Response(JSON.stringify({ message: 'Email sent successfully', info }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 200,
		})
	} catch (error: any) {
		console.error('Error enviando correo:', error)
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			status: 400,
		})
	}
})