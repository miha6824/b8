import React, { useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button, Card, Checkbox, Appbar } from 'react-native-paper'; // Added Card, Checkbox, and Appbar
import { FlatList } from 'react-native'; // Added FlatList

// Redux slice for todos
const todoSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ id: Date.now().toString(), text: action.payload, completed: false });
    },
    toggleTodo: (state, action) => {
      const todo = state.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      return state.filter(todo => todo.id !== action.payload);
    },
    editTodo: (state, action) => {
      const { id, text } = action.payload;
      const todo = state.find(todo => todo.id === id);
      if (todo) {
        todo.text = text;
      }
    },
  },
});

const { actions, reducer } = todoSlice;
const store = configureStore({ reducer: { todos: reducer } });

// Authentication slice for managing login state
const authSlice = createSlice({
  name: 'auth',
  initialState: { isLoggedIn: false },
  reducers: {
    login: (state) => {
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.isLoggedIn = false;
    },
  },
});

const { actions: authActions, reducer: authReducer } = authSlice;
const rootReducer = {
  todos: reducer,
  auth: authReducer,
};
const authStore = configureStore({ reducer: rootReducer });

// App Component with navigation
const App = () => {
  return (
    <Provider store={authStore}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="TodoList" component={TodoListScreen} options={{ title: 'Danh sách công việc' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

// Login Screen Component
const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  const handleLogin = () => {
    // Basic validation
    if (username.trim() === '' || password.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }
    
    // Simulated login logic - for demo purposes
    if (username === 'admin' && password === 'password') {
      dispatch(authActions.login());
    } else {
      Alert.alert('Lỗi', 'Tài khoản hoặc mật khẩu không đúng.');
    }
  };

  if (isLoggedIn) {
    return null; // Redirecting directly in stack navigator
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button mode="contained" onPress={handleLogin} style={styles.loginButton}>
        Đăng nhập
      </Button>
    </View>
  );
};

// TodoList Screen Component
const TodoListScreen = () => {
  const [text, setText] = useState('');
  const [editText, setEditText] = useState('');
  const [editingId, setEditingId] = useState(null); // Track the id of the todo being edited
  const todos = useSelector(state => state.todos);
  const dispatch = useDispatch();

  const handleAddTodo = () => {
    if (text.trim().length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung công việc.');
      return;
    }
    dispatch(actions.addTodo(text));
    setText('');
  };

  const handleToggleTodo = (id) => {
    dispatch(actions.toggleTodo(id));
  };

  const handleDeleteTodo = (id) => {
    dispatch(actions.deleteTodo(id));
  };

  const handleEditTodo = (id) => {
    const todoToEdit = todos.find(todo => todo.id === id);
    if (todoToEdit) {
      setEditingId(id);
      setEditText(todoToEdit.text);
    }
  };

  const handleSaveEdit = () => {
    dispatch(actions.editTodo({ id: editingId, text: editText }));
    setEditingId(null);
    setEditText('');
  };

  const renderTodo = ({ item }) => (
    <Card style={styles.todoItem}>
      <View style={styles.todoContent}>
        <Checkbox
          status={item.completed ? 'checked' : 'unchecked'}
          onPress={() => handleToggleTodo(item.id)}
        />
        {editingId === item.id ? (
          <>
            <TextInput
              style={[styles.todoText, styles.editTextInput]}
              value={editText}
              onChangeText={setEditText}
            />
            <Button mode="contained" onPress={handleSaveEdit}>
              Lưu
            </Button>
          </>
        ) : (
          <>
            <Text style={[styles.todoText, item.completed && styles.completedText]}>
              {item.text}
            </Text>
            <TouchableOpacity onPress={() => handleEditTodo(item.id)} style={styles.editButtonContainer}>
              <Text style={styles.editButton}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTodo(item.id)} style={styles.deleteButtonContainer}>
              <Text style={styles.deleteButton}>Xóa</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Todo List" />
      </Appbar.Header>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập công việc mới"
          placeholderTextColor="#888"
          value={text}
          onChangeText={setText}
        />
        <Button mode="contained" onPress={handleAddTodo} style={styles.addButton}>
          Thêm
        </Button>
      </View>
      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const Stack = createStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 16,
    elevation: 2,
  },
  loginButton: {
    width: '100%',
    marginTop: 12,
    borderRadius: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  addButton: {
    borderRadius: 8,
  },
  listContainer: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
  todoItem: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    width: '100%',
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  editButtonContainer: {
    marginLeft: 16,
  },
  editButton: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  editTextInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginRight: 8,
  },
  deleteButtonContainer: {
    marginLeft: 16,
  },
  deleteButton: {
    color: '#ff5252',
    fontWeight: 'bold',
  },
});

export default App;
