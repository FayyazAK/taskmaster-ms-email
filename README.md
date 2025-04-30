# 📧 TaskMaster Email Service

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)
![Nodemailer](https://img.shields.io/badge/Nodemailer-6.9+-blue.svg)

The TaskMaster Email Service is a dedicated microservice responsible for handling all email communications in the TaskMaster ecosystem.

## ✨ Features

### Email Management

- User registration confirmation emails
- Password reset functionality
- Task reminder notifications
- Due date notifications
- List sharing invitations
- Customizable email templates
- Support for multiple email providers
- Email queue management
- Retry mechanism for failed emails
- Email tracking and logging

### Security

- Secure email transmission
- Rate limiting for email sending
- Spam protection measures
- Email validation and sanitization

## 🛠️ Technical Stack

- **Backend**: Node.js, Express.js 5.x
- **Email**: Nodemailer
- **Templating**: Handlebars
- **Queue**: Bull (Redis-based)
- **Logging**: Winston with daily rotation

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Redis (v6.0 or higher)
- npm or yarn
- Email service provider (SMTP credentials)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YourUsername/taskmaster-ms-email.git
   cd taskmaster-ms-email
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file using `.env-example` as template

4. Start the service:
   ```bash
   # Development mode
   npm start
   ```

## 🌐 API Endpoints

### Email Operations

- `POST /api/email/send` - Send a single email
- `POST /api/email/bulk` - Send multiple emails
- `GET /api/email/status/:id` - Check email status
- `POST /api/email/template` - Create/update email template
- `GET /api/email/templates` - List all templates

### Email Types

- Registration confirmation
- Password reset
- Task reminders
- Due date notifications
- List sharing invitations
- System notifications

## 📧 Email Templates

- HTML and text versions
- Customizable branding
- Dynamic content support
- Responsive design
- Localization support

## 📄 License

This project is licensed under the ISC License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

Made with ❤️ by Fayyaz AK
