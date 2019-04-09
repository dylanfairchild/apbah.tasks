import React from 'react';
import styled from 'styled-components';
import Task from './task';
import { Draggable, Droppable } from 'react-beautiful-dnd';

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  width: 220px;

  background-color: white;

  display: flex;
  flex-direction: column;
`;
const Title = styled.h3`
  padding: 8px;
`;
const TaskList = styled.div`
  padding: 8px;
  transition: background-color 0.6s ease;
  background-color: ${props => (props.isDraggingOver ? 'lightgrey' : 'inherit')};
  flex-grow: 1;
  min-height: 100px;
`;

// We do this to stop EVERYTHING from re-render.
// https://egghead.io/lessons/react-optimize-performance-in-react-beautiful-dnd-with-shouldcomponentupdate-and-purecomponent
class InnerList extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.tasks === this.props.tasks) {
      return false
    }
    return true
  }

  render () {
    return this.props.tasks.map((task, index) => (
      <Task key={task.id} task={task} index={index} />
    ))
  }
}

export default class Column extends React.Component {
  render() {
    return (
        <Draggable
          draggableId={this.props.column.id}
          index={this.props.index}
        >
          {(provided) => (
            <Container
              {...provided.draggableProps}
              ref={provided.innerRef}
            >
              <Title
                {...provided.dragHandleProps}
              >
                {this.props.column.title}
              </Title>
              <Droppable
                droppableId={this.props.column.id}
                type="task"
                isDropDisabled={this.props.isDropDisabled}
              >
                {(provided, snapshot) => (
                  <TaskList
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    isDraggingOver={snapshot.isDraggingOver}
                  >
                    <InnerList tasks={this.props.tasks}></InnerList>
                    {provided.placeholder}
                  </TaskList>
                )}
              </Droppable>
            </Container>
          )}
        </Draggable>
    )
  }
}