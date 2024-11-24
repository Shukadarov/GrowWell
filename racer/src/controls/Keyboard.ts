import { useEffect, useState } from 'react'
import { keys } from '../keys'
import { isControl, useStore } from '../store'
import type { BindableActionName } from '../store'

export function Keyboard() {
  let emotion = 'happy'
  const [actionInputMap, actions, binding] = useStore(({ actionInputMap, actions, binding }) => [actionInputMap, actions, binding])

  // Fetching function
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/emotion'); // Replace with your API URL
      const result = await response.text();
      emotion = result; // Update state with fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Fetch data when component mounts
    fetchData();

    // Set interval to fetch data every second
    const intervalId = setInterval(fetchData, 300);

    if (binding) return
    const keyMap: Partial<Record<string, BindableActionName>> = keys(actionInputMap).reduce(
      (out, actionName) => ({ ...out, ...actionInputMap[actionName].reduce((inputs, input) => ({ ...inputs, [input]: actionName }), {}) }),
      {},
    )

    const downHandler = ({ key, target }: KeyboardEvent) => {
      if (emotion !== 'happy') {
        return;
      }
      const actionName = keyMap[key.toLowerCase()]
      if (!actionName || (target as HTMLElement).nodeName === 'INPUT' || !isControl(actionName)) return
      actions[actionName](true)
    }

    const upHandler = ({ key, target }: KeyboardEvent) => {
      const actionName = keyMap[key.toLowerCase()]
      if (!actionName || (target as HTMLElement).nodeName === 'INPUT') return
      actions[actionName](false)
    }

    window.addEventListener('keydown', downHandler, { passive: true })
    window.addEventListener('keyup', upHandler, { passive: true })

    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [actionInputMap, binding])

  return null
}
