# Embedded Chat System

This project is an embedded chat system designed for product sales and support. It utilizes the OpenAI API to provide intelligent responses to user inquiries. The chat interface is built with React and can be easily integrated into any website.

## Features

- Real-time chat interface
- Integration with OpenAI for intelligent responses
- Easy to embed in any website

## Project Structure

```
embedded-chat-system
├── src
│   ├── components
│   │   └── ChatWidget.tsx
│   ├── pages
│   │   └── api
│   │       └── chat.ts
│   ├── utils
│   │   └── openaiClient.ts
│   └── styles
│       └── ChatWidget.module.css
├── public
│   └── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/embedded-chat-system.git
   ```

2. Navigate to the project directory:
   ```
   cd embedded-chat-system
   ```

3. Install the dependencies:
   ```
   npm install
   ```

### Configuration

1. Obtain your OpenAI API key from [OpenAI](https://platform.openai.com/settings/profile/api-keys).
2. Create a `.env` file in the root of the project and add your API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### Running the Application

To start the development server, run:
```
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the chat system in action.

### Deployment

You can deploy this application for free on Vercel. Follow the instructions on the Vercel website to connect your GitHub repository and deploy your application.

## Usage

Once the application is running, you can interact with the chat widget embedded in your website. Users can ask questions related to product sales and support, and the system will respond using the OpenAI API.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.