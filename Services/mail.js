const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD,
	},
});

const sendmail = async (dest, subject, text, receipt = null) => {
	try {

		let mailData = receipt ? {
			from: '"Chopain" <maddison53@ethereal.email>', // sender address
			to: dest, // list of receivers
			subject: subject, // Subject line
			html: `<b>${text}</b>`, // html body
			attachments: [
				{
					filename: 'recue.pdf',
					contentType: 'application/pdf',
					path: receipt,
				}
			]
		} : {
			from: '"Chopain" <maddison53@ethereal.email>', // sender address
			to: dest, // list of receivers
			subject: subject, // Subject line			html: "<b>Hello world?</b>", // html body
			html: `<b>${text}</b>`, // html body
		}

		await transporter.sendMail(mailData)
	} catch (error) {
		console.log(error)
	}
}


module.exports = sendmail
