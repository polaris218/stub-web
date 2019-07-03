#Website

###INSTALLATION
1. Run the following commands in website folder. Make sure you have admin access.
```
  npm install
  node server.js 
```
2. Download & Install Google App Engine for Python and Click Add Existing and point to the server folder. Set port to 3000.
3. Start the server by clicking the play button
4. Go to http://localhost:3000/

The node js server is hot reloaded so as you make changes you will see the browser window updated :)

###GUIDELINES

#### Assets
1. All assets & images should be put under `/static/images/*.*`. These assets can be referenced in code like `src="/images/user.png"/>;`

#### React Containers & Components
1. Top Level Pages should have a React Component created under `src/containers` folder and routes should only use these components
2. A Container can be composed of multiple components. These components should be placed under `src/components` folder. Take a look at Dashboard for example.
3. Build the site for re-use. Paramterize components as much as possible. E.g. even the marketing text to landing pages should be parameterized.

#### Styling
1. All global styles that can potentially be used all Containers or the whole site should be put under `src/styles/*.scss`
2. All component specific styles should be declard besides each component thats the modern way of doing it. Look at `header.js` and `header.module.scss` to see how they work. Note: `.module.scss` extension is required for these inline styles to work.
