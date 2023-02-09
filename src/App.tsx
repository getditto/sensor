import { usePendingCursorOperation } from '@dittolive/react-ditto'
import React from 'react'

type Props = {}

export default function App({}: Props) {
  
  const { documents } = usePendingCursorOperation({
    'collection': 'readings'
  })
  
  return (
    <div>number of docs {documents.length}</div>
  )
}