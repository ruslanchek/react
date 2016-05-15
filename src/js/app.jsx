import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Parse from 'parse';
import * as ParseReact from 'parse-react';

var ParseComponent = ParseReact.Component(React);

// Parse.initialize('123', '123', '123');
// Parse.serverURL = 'http://localhost:1337/parse';

class CommentBlock extends React.Component {
	render(){
		return <div className="hello">Hello world!</div>;
	};
}

ReactDOM.render(
	<CommentBlock/>,
	document.getElementById('app')
);