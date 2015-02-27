var React = require('react');
var Immutable = require('immutable');
var undore = require('undore');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

function makeTodo(text, checked) {
  return Immutable.Map({ text: text, checked: checked })
}

var MainApp = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    var data = undore({ 
      'todos': Immutable.List([
        makeTodo('Buy bananas', true),
        makeTodo('Learn latin', false),
        makeTodo('Lorem ipsum dolor sit amet', false),
        makeTodo('Go on the moon', false),
        makeTodo('Make a todo list', true)
      ])
    });

    return { data: data, text: '' };
  },

  componentDidMount: function() {
    window.addEventListener('keydown', function(key) {
      // this only _kind of_ works on Mac...
      if(key.metaKey && !key.shiftKey && key.which == 90) {
        this.undo();
      }

      if(key.metaKey && key.shiftKey && key.which == 90) {
        this.redo();
      }

    }.bind(this));
  },

  undo: function() {
    this.setState({ data: undore.undo(this.state.data) });
  },

  redo: function() {
    this.setState({ data: undore.redo(this.state.data) });
  },

  handleOnChange: function(i, e) {
    var todos = undore.get(this.state.data, 'todos')
                      .setIn([i, 'checked'], e.target.checked);

    this.setState({ 
      data: undore.set(this.state.data, 'todos', todos)
    });
  },

  handleAddClick: function() {
    var todos = undore.get(this.state.data, 'todos');
    var todo = makeTodo(this.state.text, false);

    this.setState({ 
      data: undore.set(this.state.data, 'todos', todos.push(todo)),
      text: ''
    });
  },

  handleTextChange: function(e) {
    this.setState({ text: e.target.value });
  },

  render: function() {
    var todos = undore.get(this.state.data, 'todos').map(function(todo, i) {
      return (
        <li key={i}>
          <label>
            <input className="check" type="checkbox" 
                   checked={todo.get('checked')} 
                   onChange={this.handleOnChange.bind(this, i)}/> 

            {todo.get('text')}
          </label>
        </li>
      );
    }, this).toArray();

    return (
      <div>
        <p>
          <input className="btn undo" type="button" value="Undo" onClick={this.undo} 
                 disabled={this.state.data.get('history').isEmpty()} />

          <input className="btn redo" type="button" value="Redo" 
                 disabled={this.state.data.get('redos').isEmpty()}
                 onClick={this.redo} />
        </p>
        <p>
          <input className="text" type="text" placeholder="Do something" value={this.state.text} 
                 onChange={this.handleTextChange} /> 

          <input className="btn add" type="button" value="Add" 
                 disabled={this.state.text == ''}
                 onClick={this.handleAddClick} />
        </p>
        <ul>
          {todos}
        </ul>
      </div>
    );
  }
});

module.exports = MainApp;
