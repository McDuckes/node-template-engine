# Node Template Engine
A simple, extensible template engine for Node.js in 100 lines (or less)

## Usage

Intialize the folder where your templates lie
```javascript
Templater.setTemplateFolder('./resources/');
```

Add tag to your html
```javascript
<button>{{data.buttonText}}</button>
```

Render the template as a response
```javascript
response.end(await Templater.render('homepage.html',{buttonText:'This text will be displayed on the button'}));
```


## Expansion

Add your own tags to the regex in the parse function
```javascript
/{{(.*?)}}|/
```

like so
```javascript
/{{(.*?)}}|YOURTAG(.*?)YOURTAG/g
```

And then add the handling of the tag to the compile function:
```javascript
parsed.map(t => {
            if (t.startsWith("YOURTAG") && t.endsWith("YOURTAG")) {
                renderFunction += `+${t.substring(7, t.length - 7)}`; //Or something else
            } else ...
```

More complex features like if and for loops work the same way, just transform them into a fitting js script.
For this simple project they are out of scope though.


## Misc
Only depends on Node.js' fs module, so it should be easy to adapt it to your platform
