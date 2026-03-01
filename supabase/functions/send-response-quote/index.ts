import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import nodemailer from 'npm:nodemailer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      throw new Error('to, subject and html are required')
    }

    const SMTP_PASS = Deno.env.get('SMTP_PASS')
    
    if (!SMTP_PASS) {
      console.log("Modo Simulación: SMTP_PASS no configurado.")
      return new Response(JSON.stringify({ 
        message: 'Simulation Mode: Email generated successfully (No SMTP_PASS)', 
        recipient: to 
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
      to,
      subject,
      html,
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
