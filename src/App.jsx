import React from 'react';

class App extends React.Component {
  render() {
    if (!this.props.heading) {
      return null;
    }
    return (
      <h1>{ this.props.heading }</h1>
    );
  }
}

App.propTypes = {
  heading: React.PropTypes.string.isRequired
};

export default App;
