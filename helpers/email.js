const nodemailer=require('nodemailer');

// mailtrap
const emailRegister=async(datos={})=>{
  const {email,name,token}=datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIl_PORT,
    auth: {
      user: process.env.EMAIl_USER,
      pass: process.env.EMAIl_PASSWORD
    }
  });


  // Infor de correo
  const info=await transport.sendMail({
    from:'"Uptasks -Administrador de proyectos" <jdvpl@uptasks.com>',
    to:email,
    subject:'Confirmacion de tu cuenta - Uptasks',
    text:'Confirmacion de tu cuenta- Uptasks',
    html:`<p>Hola <b>${name}</b>, confirma tu cuenta en UPTASKS</p>
    <p>Tu cuenta esta ya casi lista, solo debes comprobarla en el siguiente enlace <a href="${process.env.F1_URL}/confirm/${token}">Confirmar cuenta</a></p>

    <p>Si tu no creaste esta cuenta, puede ignorar el mensaje.</p>
    `
  })
}

module.exports =emailRegister;