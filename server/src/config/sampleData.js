export const sampleLessons = [
  {
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript programming language",
    content: [
      {
        type: "text",
        title: "What is JavaScript?",
        body: "JavaScript is a programming language that enables interactive web pages. It's a core technology of the World Wide Web and is essential to web applications, many of which couldn't exist without it. JavaScript is used to create responsive, interactive elements for web pages, adding behaviors to static HTML."
      },
      {
        type: "text",
        title: "JavaScript Variables",
        body: "Variables are containers for storing data (values). In JavaScript, you can declare variables using var, let, or const keywords. For example: let name = 'John'; const age = 30; Variables declared with let can be reassigned, while variables declared with const cannot be reassigned.",
        questions: [
          {
            _id: "js_var_q1",
            text: "Which keyword creates a variable that cannot be reassigned?",
            options: ["var", "let", "const", "function"],
            correctAnswer: "const"
          },
          {
            _id: "js_var_q2",
            text: "What will happen if you try to reassign a value to a const variable?",
            options: ["Nothing, it will work fine", "You'll get a syntax error", "The variable will be automatically converted to let", "You'll get a TypeError"],
            correctAnswer: "You'll get a TypeError"
          }
        ]
      },
      {
        type: "text",
        title: "JavaScript Functions",
        body: "Functions are blocks of code designed to perform a particular task. A JavaScript function is executed when 'something' invokes it (calls it). For example: function greet(name) { return 'Hello, ' + name + '!'; }. You can call this function using: greet('John'); which returns 'Hello, John!'.",
        questions: [
          {
            _id: "js_func_q1",
            text: "What is the correct way to call a function named 'displayMessage'?",
            options: ["call displayMessage()", "displayMessage()", "function displayMessage()", "run displayMessage()"],
            correctAnswer: "displayMessage()"
          }
        ]
      }
    ]
  },
  {
    title: "CSS Fundamentals",
    description: "Master the basics of Cascading Style Sheets for web styling",
    content: [
      {
        type: "text",
        title: "What is CSS?",
        body: "CSS (Cascading Style Sheets) is a stylesheet language used to describe the presentation of a document written in HTML. CSS describes how elements should be rendered on screen, on paper, in speech, or on other media. It can control the layout of multiple web pages all at once."
      },
      {
        type: "text",
        title: "CSS Selectors",
        body: "CSS selectors are used to 'find' (or select) the HTML elements you want to style. They can be divided into five categories: simple selectors (select elements based on name, id, class), combinator selectors, pseudo-class selectors, pseudo-element selectors, and attribute selectors.",
        questions: [
          {
            _id: "css_sel_q1",
            text: "Which selector would you use to target an element with id='header'?",
            options: [".header", "#header", "element.header", "*header"],
            correctAnswer: "#header"
          },
          {
            _id: "css_sel_q2",
            text: "Which selector targets all paragraph elements with the class 'intro'?",
            options: ["p.intro", "#p intro", "p[intro]", ".p.intro"],
            correctAnswer: "p.intro"
          }
        ]
      },
      {
        type: "text",
        title: "CSS Box Model",
        body: "All HTML elements can be considered as boxes. The CSS box model is essentially a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content. The box model allows us to add a border around elements, and to define space between elements.",
        questions: [
          {
            _id: "css_box_q1",
            text: "In the CSS box model, which property creates space between the element's content and its border?",
            options: ["margin", "padding", "border-spacing", "element-spacing"],
            correctAnswer: "padding"
          }
        ]
      }
    ]
  },
  {
    title: "Introduction to React",
    description: "Learn the basics of the React JavaScript library for building user interfaces",
    content: [
      {
        type: "text",
        title: "What is React?",
        body: "React is a JavaScript library for building user interfaces. It's maintained by Facebook and a community of individual developers and companies. React can be used as a base in the development of single-page or mobile applications. It's only concerned with rendering data to the DOM."
      },
      {
        type: "text",
        title: "React Components",
        body: "Components are the building blocks of any React application. A component is a JavaScript class or function that optionally accepts inputs (called 'props') and returns a React element that describes how a section of the UI should appear. Components can be nested inside other components to allow complex applications to be built out of simple building blocks.",
        questions: [
          {
            _id: "react_comp_q1",
            text: "What is the main advantage of breaking down a UI into components?",
            options: ["It makes the code easier to debug", "It allows for reusability and better organization", "It improves server-side rendering", "It reduces the file size of the application"],
            correctAnswer: "It allows for reusability and better organization"
          }
        ]
      },
      {
        type: "text",
        title: "JSX in React",
        body: "JSX is a syntax extension for JavaScript recommended by React. It looks similar to HTML but works within JavaScript code. JSX makes it easier to write and add HTML in React. For example: const element = <h1>Hello, world!</h1>;. JSX is not required to use React, but makes the code more readable and expressive.",
        questions: [
          {
            _id: "react_jsx_q1",
            text: "Which of the following is valid JSX?",
            options: ["<div>Hello {username}!</div>", "<div>Hello (username)!</div>", "<div>Hello ${username}!</div>", "<div>Hello [username]!</div>"],
            correctAnswer: "<div>Hello {username}!</div>"
          },
          {
            _id: "react_jsx_q2",
            text: "In React, how do you write a comment inside JSX?",
            options: [
              "// This is a comment", 
              "<!-- This is a comment -->", 
              "/* This is a comment */", 
              "{/* This is a comment */}"
            ],
            correctAnswer: "{/* This is a comment */}"
          }
        ]
      }
    ]
  }
]; 