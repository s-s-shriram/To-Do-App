import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Load tasks from AsyncStorage
  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem("@tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage
  const saveTasks = async (newTasks) => {
    setTasks(newTasks);
    await AsyncStorage.setItem("@tasks", JSON.stringify(newTasks));
  };

  const addOrEditTask = () => {
    if (task.trim() === "") return;

    if (editingId) {
      const updatedTasks = tasks.map((t) =>
        t.id === editingId ? { ...t, text: task } : t
      );
      saveTasks(updatedTasks);
      setEditingId(null);
    } else {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      saveTasks([...tasks, newTask]);
    }
    setTask("");
  };

  const deleteTask = (id) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Yes",
        onPress: () => saveTasks(tasks.filter((t) => t.id !== id)),
      },
    ]);
  };

  const editTask = (id, text) => {
    setTask(text);
    setEditingId(id);
  };

  const toggleComplete = (id) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 To-Do App</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addOrEditTask}>
          <Text style={styles.addText}>{editingId ? "UPDATE" : "ADD"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => toggleComplete(item.id)}
            >
              <Text
                style={[
                  styles.taskText,
                  item.completed && { textDecorationLine: "line-through", color: "#888" },
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttons}>
              <TouchableOpacity onPress={() => editTask(item.id, item.text)}>
                <Text style={styles.editText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteText}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  inputContainer: { flexDirection: "row", marginBottom: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  addButton: { marginLeft: 10, backgroundColor: "#007bff", padding: 12, borderRadius: 5 },
  addText: { color: "#fff", fontWeight: "bold" },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  taskText: { fontSize: 16, flex: 1 },
  buttons: { flexDirection: "row", alignItems: "center" },
  editText: { fontSize: 18, marginRight: 10 },
  deleteText: { fontSize: 18 },
});
