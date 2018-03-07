import React from 'react';
import skygear from 'skygear/react-native';
import skygearChat from 'skygear-chat';
import { StyleSheet, Text, View, ListView, Button } from 'react-native';
import {
  StackNavigator,
} from 'react-navigation';

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Conversations',
  };

  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
    };
  }

  componentDidMount() {
    console.log('componentDidMount');
    // skygear._db.cacheResponse = false;
    skygear.config({
      'endPoint': 'https://chatdemoapp.skygeario.com/', // trailing slash is required
      'apiKey': 'c0d796f60a9649d78ade26e65c460459'
    })
    .then(() => {
      return this.loginUser();
    })
    .then(() => {
      console.log('skygear.auth.currentUser', skygear.auth.currentUser);
      return skygearChat.getConversation("f503a6a7-9f25-4f50-831f-860551813d54");
    })
    .then((con) => {
      console.log('getConversation', con);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  handle(data) {
    console.log(data);
  }

  loginUser() {
    return skygear.auth.loginWithUsername("howa", "howa").then((user) => {
      return skygearChat.getConversations().then(conversations => {
        console.log('Loaded conversations.');
        console.log(conversations.map(c => c.title));
        this.setState({dataSource: this.state.dataSource.cloneWithRows(conversations.map(c => ({title: c.title, id: c._id})))});
      });
    }, (error) => {
      console.error(error);
      if (error.error.code === skygear.ErrorCodes.InvalidCredentials ||
          error.error.code === skygear.ErrorCodes.ResourceNotFound ) {
        // incorrect username or password
      } else {
        // other kinds of error
      }
      return error;
    });
  }

  renderRow(rowData) {
    return (
      <View>
        <Text>{rowData.title}</Text>
        <Text>{rowData.id}</Text>
        <Button
          title="Go"
          onPress={() => this.props.navigation.navigate('Conversation', {
  		    conversationId: rowData.id
          })}
        />
     </View>
    );
  }

  render() {
    console.log("test");
    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.dataSource}
 		  renderRow={this.renderRow.bind(this)}
        />
      </View>
    );
  }
}


class ConversationScreen extends React.Component {
  static navigationOptions = {
    title: 'Conversation',
  };

  constructor() {
    super();
    this.rows = [];
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {dataSource: ds.cloneWithRows(this.rows)}
  }

  handle(data) {
    console.log(data);
    this.rows.push(data.record.body);
    this.setState({dataSource: this.state.dataSource.cloneWithRows(this.rows)});
  }

  appendMessages(bodies) {
    this.rows = this.rows.concat(bodies);
    this.setState({dataSource: this.state.dataSource.cloneWithRows(this.rows)});
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(this.rows),
    };

    skygearChat.getConversation(params.conversationId).then(conversation => {
      console.log(conversation);
      skygearChat.getMessages(conversation).then(messages => {
        var bodies = messages.map(m => m.body);
        console.log(messages);
   		this.appendMessages(bodies);
      });

      skygearChat.subscribe(this.handle.bind(this));
    });
  }

  renderRow(row) {
    return (<Text>{row}</Text>);
  }

  render() {
    return (
     <View>
       <ListView
          dataSource={this.state.dataSource}
 		  renderRow={this.renderRow.bind(this)}
       />
     </View>);
  }
}


export default App = StackNavigator({
  Home: { screen: HomeScreen },
  Conversation: { screen: ConversationScreen },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

