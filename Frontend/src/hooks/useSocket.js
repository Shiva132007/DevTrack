import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import {
  addTaskFromSocket,
  updateTaskFromSocket,
  removeTaskFromSocket,
} from '../store/slices/taskSlice.js';

const SOCKET_URL = 'http://localhost:5000';

const useSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('task:created', (task) => {
      dispatch(addTaskFromSocket(task));
    });

    socket.on('task:updated', (task) => {
      dispatch(updateTaskFromSocket(task));
    });

    socket.on('task:deleted', ({ id }) => {
      dispatch(removeTaskFromSocket(id));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return socketRef.current;
};

export default useSocket;