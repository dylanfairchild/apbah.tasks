import React from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Column from './column'
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
`;

class InnerList extends React.PureComponent {
  render() {
    const {column, taskMap, index} = this.props
    const tasks = column.taskIds.map(taskId => taskMap[taskId])
    return <Column column={column} tasks={tasks} index={index}></Column>
  }
}

export default class Tutorial extends React.Component {
  constructor(props) {
    super(props)
    this.state = initialData;

    this.onDragStart = this.onDragStart.bind(this)
    this.onDragUpdate = this.onDragUpdate.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
  }

  onDragStart(start, provided) {
    document.body.style.color = 'orange';
    document.body.style.transition = 'background-color 0.2s ease'

    const homeIndex = this.state.columnOrder.indexOf(start.source.droppableId)

    this.setState({
      homeIndex,
    })

    provided.announce(
      `You have lifted the task in position ${start.source.index + 1}`
    ) // Override default react-beautiful-dnd messaging
  }

  onDragUpdate(update, provided) {
    const { destination } = update;
    const opacity = destination
      ? destination.index / Object.keys(this.state.tasks).length
      : 0
    document.body.style.backgroundColor = `rgba(153, 141, 217, ${opacity})`

    const message = update.destination
      ? `You have moved the task to position ${update.destination.index + 1}`
      : `You are currently not over a droppable area`
    provided.announce(message)
  }

  onDragEnd(result, provided) {
    const message = result.destination
      ? `You have moved the task from position
        ${result.source.index + 1} to ${result.destination.index + 1}`
      : `The task has been returned to its starting position of
        ${result.source.index + 1}`;
    provided.announce(message)

    document.body.style.color = 'inherit'
    document.body.style.backgroundColor = 'inherit'

    this.setState({
      homeIndex: null,
    })

    const {destination, source, draggableId, type} = result;

    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(this.state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        columnOrder: newColumnOrder,
      }

      this.setState(newState)
      return
    }

    const start = this.state.columns[source.droppableId]
    const finish = this.state.columns[destination.droppableId]

    if (start === finish) {
      const column = this.state.columns[source.droppableId]
      const newTaskIds = Array.from(column.taskIds)
      // Do not mutate existing state, create new!
  
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)
  
      const newColumn = {
        ...column,
        taskIds: newTaskIds
      }
  
      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn,
        }
      }  

      this.setState(newState)
      return
    }

    // moving from one column to another
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    }

    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    }

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      }
    }

    this.setState(newState)
  }

  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {provided => (
            <Container
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {this.state.columnOrder.map((columnId, index) => {
                const column = this.state.columns[columnId];
                return (
                  <InnerList
                    key={column.id}
                    column={column}
                    taskMap={this.state.tasks}
                    index={index}
                  >
                  </InnerList>
                )
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    )
  }
}