// ButtonComponent.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CameraGrid from './CameraGrid';
import { NameComponentProvider } from '../../scripts/NameComponentContext';

// Mock RTCPeerConnection
class MockRTCPeerConnection {
    constructor() {}
    // Add any necessary methods or properties here
}
global.RTCPeerConnection = MockRTCPeerConnection;

// Mock fetch() definition
global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    ok: true,
    json: () => Promise.resolve({}), // Mock JSON response
  })
);

// Test 1 - (Add and remove one VideoFrame)
test('VideoFrame renders upon button click', async () => {

  // Arrange ----------------

  const { getByTestId, queryByTestId } = render(<NameComponentProvider><CameraGrid /></NameComponentProvider>);
  expect(queryByTestId("1")).toBeFalsy();

  // Act --------------------

  const inputElement = getByTestId('cameraIP-test');
  fireEvent.change(inputElement, { target: { value: 'mock-url' } });
  const button = getByTestId('add-camera-btn-1');
  fireEvent.click(button);

  // Assert -----------------
  
  expect(queryByTestId("1")).toBeTruthy();

});

// Test 2 - (Remove one video frame)
test('VideoFrame unrenders upon button click', async () => {

  // Arrange ----------------

  const { getByTestId, queryByTestId } = render(<NameComponentProvider><CameraGrid /></NameComponentProvider>);
  expect(queryByTestId("1")).toBeFalsy();

  // Act --------------------

  // Add a video frame
  const inputElement = getByTestId('cameraIP-test');
  fireEvent.change(inputElement, { target: { value: 'mock-url' } });
  const add_btn = getByTestId('add-camera-btn-1');
  fireEvent.click(add_btn);

  // Remove the video frame
  const remove_btn = getByTestId('close-camera-btn-1');
  fireEvent.click(remove_btn);

  // Assert -----------------
  expect(queryByTestId("1")).toBeFalsy();

});