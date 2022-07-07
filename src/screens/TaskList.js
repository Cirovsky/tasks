import React, { Component } from "react"
import {
    SafeAreaView,
    View, Text,
    ImageBackground,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    Alert
} from "react-native"

import AsyncStorage from "@react-native-community/async-storage"
import Icon from 'react-native-vector-icons/FontAwesome'
import moment from "moment"
import 'moment/locale/pt-br'


import Task from "../components/Task"
import AddTask from "./AddTask"
import todayImage from "../../assets/imgs/today.jpg"
import commonStyles from "../commonStyles"

const initialState = {
    showDoneTasks: true,
    showAddTask: false,
    visibleTasks:[],
    tasks: []
}

export default class TaskList extends Component {
    state = {
        ...initialState
    }

    componentDidMount = async () => {
        const stateString = await AsyncStorage.getItem('taskState')
        const state = JSON.parse(stateString) || initialState
        this.setState(state, this.filterTasks)
    }

    addNewTask = newTask => {
        if (!newTask.desc || !newTask.desc.trim()){
            Alert.alert('Dados Inválidos', 'Descrição não informada')
            return
        }

        const tasks = [...this.state.tasks]
        tasks.push({
            id: Math.random(),
            desc: newTask.desc,
            estimateAt: newTask.date,
            doneAt: null
        })
        this.setState({tasks, showAddTask: false}, this.filterTasks)
    }
    
    toogleFilter = () => {
        this.setState({showDoneTasks: !this.state.showDoneTasks}, this.filterTasks)
    }


    filterTasks = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks){
            visibleTasks = [...this.state.tasks]
        }else{
            const pedding = task => task.doneAt === null
            visibleTasks = this.state.tasks.filter(pedding)
        }
        this.setState({visibleTasks})
        AsyncStorage.setItem('taskState', JSON.stringify(this.state))
    }

    toogleTask = taskId => {
        const tasks = [...this.state.tasks]
        tasks.forEach(task => {
            if (task.id === taskId) {
                task.doneAt = task.doneAt ? null : new Date()
            }
        })
        this.setState({tasks},this.filterTasks)
    }

    deleteTask = taskId => {
        const tasks = this.state.tasks.filter(task=> task.id !== taskId)
        this.setState({ tasks}, this.filterTasks)
    }

    render() {
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <SafeAreaView style={styles.container}>
                <AddTask onSave ={this.addNewTask}
                    isVisible={this.state.showAddTask}
                    onCancel={()=> this.setState({showAddTask: false})}
                />
                <ImageBackground source={todayImage} style={styles.background}>
                    <View style = {styles.iconBar}>
                        <TouchableOpacity onPress={this.toogleFilter}>
                            <Icon 
                            name={this.state.showDoneTasks? 'eye' : 'eye-slash'} 
                            size={20} color={commonStyles.colors.secondary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskList}>
                    <FlatList 
                        data={this.state.visibleTasks}
                        keyExtractor={item => `${item.id}`}
                        renderItem={
                            ({ item }) => <Task 
                            {...item}
                            onToogleTask={this.toogleTask}
                            onDelete = {this.deleteTask}
                            />}
                    />
                </View>
                    <TouchableOpacity 
                        activeOpacity={0.7}
                        onPress={()=> this.setState({showAddTask: true})}
                        style={styles.addButton}
                    >
                        <Icon 
                            name="plus" 
                            size={30} 
                            color={commonStyles.colors.secondary}
                        />
                    </TouchableOpacity>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    background: {
        flex: 2
    },
    taskList: {
        flex: 8
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 40,
        marginLeft: 20,
        marginBottom: 5
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 15,
        marginLeft: 20,
        marginBottom: 10
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginTop: Platform.OS === 'ios' ? 40 : 10
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: commonStyles.colors.today
    }
});