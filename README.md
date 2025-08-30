This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`
Runs the React frontend in development mode at [http://localhost:3000](http://localhost:3000).

### `npm run server` or `yarn server`
Runs the backend Express server (API) at [http://localhost:4000](http://localhost:4000).

### `npm run server:dev` or `yarn server:dev`
Runs the backend server in development mode with auto-reload using nodemon.

### `npm run dev` or `yarn dev`
Runs both the frontend and backend servers concurrently for full-stack development.

### `npm run build` or `yarn build`
Builds the React app for production to the `build` folder.

### `npm test` or `yarn test`
Launches the test runner in interactive watch mode.

### `npm run eject` or `yarn eject`
**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

---

## Database Reset

To reset the MongoDB database (remove all users and tickets):

1. Open a terminal and run:
	```bash
	mongosh mongodb://127.0.0.1:27017/bgm_referrals
	db.users.deleteMany({})
	db.tickets.deleteMany({})
	```
Or create a script to clear collections if you prefer.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
