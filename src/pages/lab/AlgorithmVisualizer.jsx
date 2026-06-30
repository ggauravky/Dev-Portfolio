// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'

// ==========================================
// PATHFINDING UTILITIES & ALGORITHMS
// ==========================================

const createNode = (row, col, startNode, endNode) => ({
    row,
    col,
    isStart: row === startNode.row && col === startNode.col,
    isEnd: row === endNode.row && col === endNode.col,
    isWall: false,
    isVisited: false,
    isPath: false,
    distance: Infinity,
    totalDistance: Infinity, // fScore for A*
    previousNode: null,
})

const initializeGrid = (startNode, endNode, isComparison, rows, cols) => {
    const grid = []
    for (let r = 0; r < rows; r++) {
        const currentRow = []
        for (let c = 0; c < cols; c++) {
            currentRow.push(createNode(r, c, startNode, endNode))
        }
        grid.push(currentRow)
    }
    return grid
}

const getNeighbors = (node, grid) => {
    const neighbors = []
    const { row, col } = node
    if (row > 0) neighbors.push(grid[row - 1][col])
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col])
    if (col > 0) neighbors.push(grid[row][col - 1])
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1])
    return neighbors
}

const dijkstra = (grid, startNode, endNode) => {
    const visitedNodesInOrder = []
    const start = grid[startNode.row][startNode.col]
    start.distance = 0
    const unvisitedNodes = []
    for (const row of grid) {
        for (const node of row) {
            unvisitedNodes.push(node)
        }
    }

    while (unvisitedNodes.length > 0) {
        unvisitedNodes.sort((a, b) => a.distance - b.distance)
        const closestNode = unvisitedNodes.shift()
        if (closestNode.isWall) continue
        if (closestNode.distance === Infinity) break
        closestNode.isVisited = true
        visitedNodesInOrder.push(closestNode)
        if (closestNode.row === endNode.row && closestNode.col === endNode.col) {
            return visitedNodesInOrder
        }
        const neighbors = getNeighbors(closestNode, grid)
        for (const neighbor of neighbors) {
            const distance = closestNode.distance + 1
            if (distance < neighbor.distance) {
                neighbor.distance = distance
                neighbor.previousNode = closestNode
            }
        }
    }
    return visitedNodesInOrder
}

const astar = (grid, startNode, endNode) => {
    const visitedNodesInOrder = []
    const start = grid[startNode.row][startNode.col]
    const end = grid[endNode.row][endNode.col]
    start.distance = 0
    start.totalDistance = ManhattanDistance(start, end)
    const openSet = [start]
    const openSetLookup = new Set([start])

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.totalDistance - b.totalDistance)
        const current = openSet.shift()
        openSetLookup.delete(current)

        if (current.isWall) continue
        current.isVisited = true
        visitedNodesInOrder.push(current)

        if (current.row === endNode.row && current.col === endNode.col) {
            return visitedNodesInOrder
        }

        const neighbors = getNeighbors(current, grid)
        for (const neighbor of neighbors) {
            if (neighbor.isWall || neighbor.isVisited) continue
            const tentativeGScore = current.distance + 1

            if (tentativeGScore < neighbor.distance) {
                neighbor.previousNode = current
                neighbor.distance = tentativeGScore
                neighbor.totalDistance = tentativeGScore + ManhattanDistance(neighbor, end)
                if (!openSetLookup.has(neighbor)) {
                    openSet.push(neighbor)
                    openSetLookup.add(neighbor)
                }
            }
        }
    }
    return visitedNodesInOrder
}

const ManhattanDistance = (nodeA, nodeB) => {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)
}

const bfs = (grid, startNode, endNode) => {
    const visitedNodesInOrder = []
    const start = grid[startNode.row][startNode.col]
    start.isVisited = true
    const queue = [start]

    while (queue.length > 0) {
        const current = queue.shift()
        if (current.isWall) continue
        visitedNodesInOrder.push(current)

        if (current.row === endNode.row && current.col === endNode.col) {
            return visitedNodesInOrder
        }

        const neighbors = getNeighbors(current, grid)
        for (const neighbor of neighbors) {
            if (!neighbor.isVisited && !neighbor.isWall) {
                neighbor.isVisited = true
                neighbor.previousNode = current
                queue.push(neighbor)
            }
        }
    }
    return visitedNodesInOrder
}

const dfs = (grid, startNode, endNode) => {
    const visitedNodesInOrder = []
    const start = grid[startNode.row][startNode.col]
    const stack = [start]

    while (stack.length > 0) {
        const current = stack.pop()
        if (current.isWall) continue
        
        if (!current.isVisited) {
            current.isVisited = true
            visitedNodesInOrder.push(current)

            if (current.row === endNode.row && current.col === endNode.col) {
                return visitedNodesInOrder
            }

            const neighbors = getNeighbors(current, grid)
            for (const neighbor of neighbors.reverse()) {
                if (!neighbor.isVisited && !neighbor.isWall) {
                    neighbor.previousNode = current
                    stack.push(neighbor)
                }
            }
        }
    }
    return visitedNodesInOrder
}

const getShortestPath = (endNode, grid) => {
    const shortestPath = []
    let current = grid[endNode.row][endNode.col]
    while (current !== null) {
        shortestPath.unshift(current)
        current = current.previousNode
    }
    if (shortestPath.length === 1 && shortestPath[0].previousNode === null) {
        return []
    }
    return shortestPath
}

// ==========================================
// SORTING ALGORITHM GENERATORS
// ==========================================

const bubbleSortSteps = (arr) => {
    const steps = []
    const a = [...arr]
    const n = a.length
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            steps.push({ type: 'compare', indices: [j, j + 1] })
            if (a[j] > a[j + 1]) {
                const temp = a[j]
                a[j] = a[j + 1]
                a[j + 1] = temp
                steps.push({ type: 'swap', indices: [j, j + 1], values: [a[j], a[j + 1]] })
            }
        }
        steps.push({ type: 'sorted', index: n - i - 1 })
    }
    steps.push({ type: 'sorted', index: 0 })
    return steps
}

const selectionSortSteps = (arr) => {
    const steps = []
    const a = [...arr]
    const n = a.length
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i
        for (let j = i + 1; j < n; j++) {
            steps.push({ type: 'compare', indices: [j, minIdx] })
            if (a[j] < a[minIdx]) {
                minIdx = j
            }
        }
        if (minIdx !== i) {
            const temp = a[i]
            a[i] = a[minIdx]
            a[minIdx] = temp
            steps.push({ type: 'swap', indices: [i, minIdx], values: [a[i], a[minIdx]] })
        }
        steps.push({ type: 'sorted', index: i })
    }
    steps.push({ type: 'sorted', index: n - 1 })
    return steps
}

const insertionSortSteps = (arr) => {
    const steps = []
    const a = [...arr]
    const n = a.length
    steps.push({ type: 'sorted', index: 0 })
    for (let i = 1; i < n; i++) {
        let key = a[i]
        let j = i - 1
        steps.push({ type: 'compare', indices: [i, j] })
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j]
            steps.push({ type: 'swap', indices: [j + 1, j], values: [a[j + 1], a[j]] })
            j--
            if (j >= 0) {
                steps.push({ type: 'compare', indices: [j, j + 1] })
            }
        }
        a[j + 1] = key
        steps.push({ type: 'set', index: j + 1, value: key })
        for (let k = 0; k <= i; k++) {
            steps.push({ type: 'sorted', index: k })
        }
    }
    return steps
}

const mergeSortSteps = (arr) => {
    const steps = []
    const a = [...arr]

    const merge = (start, mid, end) => {
        const leftArr = a.slice(start, mid + 1)
        const rightArr = a.slice(mid + 1, end + 1)
        let i = 0, j = 0, k = start

        while (i < leftArr.length && j < rightArr.length) {
            steps.push({ type: 'compare', indices: [start + i, mid + 1 + j] })
            if (leftArr[i] <= rightArr[j]) {
                a[k] = leftArr[i]
                steps.push({ type: 'set', index: k, value: leftArr[i] })
                i++
            } else {
                a[k] = rightArr[j]
                steps.push({ type: 'set', index: k, value: rightArr[j] })
                j++
            }
            k++
        }

        while (i < leftArr.length) {
            a[k] = leftArr[i]
            steps.push({ type: 'set', index: k, value: leftArr[i] })
            i++
            k++
        }

        while (j < rightArr.length) {
            a[k] = rightArr[j]
            steps.push({ type: 'set', index: k, value: rightArr[j] })
            j++
            k++
        }

        for (let p = start; p <= end; p++) {
            steps.push({ type: 'sorted', index: p })
        }
    }

    const mergeSortHelper = (start, end) => {
        if (start >= end) return
        const mid = Math.floor((start + end) / 2)
        mergeSortHelper(start, mid)
        mergeSortHelper(mid + 1, end)
        merge(start, mid, end)
    }

    mergeSortHelper(0, a.length - 1)
    return steps
}

const quickSortSteps = (arr) => {
    const steps = []
    const a = [...arr]

    const partition = (low, high) => {
        const pivot = a[high]
        let i = low - 1
        for (let j = low; j < high; j++) {
            steps.push({ type: 'compare', indices: [j, high] })
            if (a[j] < pivot) {
                i++
                const temp = a[i]
                a[i] = a[j]
                a[j] = temp
                steps.push({ type: 'swap', indices: [i, j], values: [a[i], a[j]] })
            }
        }
        const temp = a[i + 1]
        a[i + 1] = a[high]
        a[high] = temp
        steps.push({ type: 'swap', indices: [i + 1, high], values: [a[i + 1], a[high]] })
        steps.push({ type: 'sorted', index: i + 1 })
        return i + 1
    }

    const quickSortHelper = (low, high) => {
        if (low < high) {
            const pi = partition(low, high)
            quickSortHelper(low, pi - 1)
            quickSortHelper(pi + 1, high)
        } else if (low === high) {
            steps.push({ type: 'sorted', index: low })
        }
    }

    quickSortHelper(0, a.length - 1)
    return steps
}

const PATHFINDING_LEARNING_DATA = {
    astar: {
        name: 'A* Search',
        desc: 'An informed search algorithm that uses distance heuristics to navigate efficiently toward the destination.',
        purpose: 'Finding the optimal path while minimizing explored nodes.',
        usage: 'GPS navigation, video game AI, self-driving cars.',
        strengths: 'Extremely fast. Guided by target direction. Guarantees the shortest path.',
        limitations: 'Requires heuristic function. High memory footprint on massive grids.',
        time: 'O(E log V) or O(b^d)',
        space: 'O(V)'
    },
    dijkstra: {
        name: 'Dijkstra Algorithm',
        desc: 'An uninformed radial search algorithm that calculates the shortest distance from the start to all nodes.',
        purpose: 'Guaranteed shortest path discovery in weighted/unweighted networks.',
        usage: 'Network routing (OSPF), database queries, mapping services.',
        strengths: 'Extremely robust. Guarantees shortest path on any positive weight graph.',
        limitations: 'Visits nodes radially in all directions. Slower and more resource-intensive.',
        time: 'O(E + V log V)',
        space: 'O(V)'
    },
    bfs: {
        name: 'Breadth-First Search (BFS)',
        desc: 'An uninformed layer-by-layer traversal algorithm exploring all neighbors at current depth first.',
        purpose: 'Finding the shortest path in unweighted networks.',
        usage: 'Social networks (degrees of separation), web crawlers, peer-to-peer systems.',
        strengths: 'Guarantees the shortest path on unweighted grids. Simple and highly predictable.',
        limitations: 'High memory usage because it stores all frontier nodes in a queue.',
        time: 'O(V + E)',
        space: 'O(V)'
    },
    dfs: {
        name: 'Depth-First Search (DFS)',
        desc: 'An uninformed traversal algorithm exploring deep along each branch before backtracking.',
        purpose: 'Searching deep paths, topological sorting, and solving mazes.',
        usage: 'Maze solving, cycle detection, game tree search.',
        strengths: 'Very low memory usage compared to BFS. Explores deep paths quickly.',
        limitations: 'Not guaranteed to find the shortest path. Can get trapped in deep branches.',
        time: 'O(V + E)',
        space: 'O(V)'
    }
}

const SORTING_LEARNING_DATA = {
    bubble: {
        name: 'Bubble Sort',
        desc: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if out of order.',
        purpose: 'Basic sorting, conceptual algorithm teaching.',
        usage: 'Education, sorting small/nearly sorted arrays.',
        strengths: 'Extremely simple. Requires only O(1) space. O(n) for already sorted arrays.',
        limitations: 'Highly inefficient on average and worst cases. Unacceptable for large datasets.',
        best: 'O(n)',
        avg: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)'
    },
    selection: {
        name: 'Selection Sort',
        desc: 'Repeatedly finds the minimum element from the unsorted section and puts it at the beginning.',
        purpose: 'Minimizing write/swap operations.',
        usage: 'Sorting systems where memory write operations are extremely expensive.',
        strengths: 'Performs a maximum of O(n) swaps. Predictable quadratic run time.',
        limitations: 'Inefficient comparison loop. Performs poorly regardless of initial array order.',
        best: 'O(n²)',
        avg: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)'
    },
    insertion: {
        name: 'Insertion Sort',
        desc: 'Builds the final sorted array one item at a time, inserting each element into its proper position.',
        purpose: 'Sorting small or stream-like continuous data.',
        usage: 'Online real-time sorting, hybrid sorting algorithms (Timsort).',
        strengths: 'Highly efficient for small arrays. Stable. Adaptive (runs in O(n) for nearly sorted inputs).',
        limitations: 'Poor performance on average and worst cases for large, randomly ordered datasets.',
        best: 'O(n)',
        avg: 'O(n²)',
        worst: 'O(n²)',
        space: 'O(1)'
    },
    merge: {
        name: 'Merge Sort',
        desc: 'A divide-and-conquer algorithm dividing the array in halves, recursively sorting and merging.',
        purpose: 'Stable sorting of massive datasets.',
        usage: 'External database sorting, sorting linked lists, standard libraries.',
        strengths: 'Guarantees O(n log n) time complexity in all cases. Stable sorting.',
        limitations: 'Requires O(n) extra memory space to hold temporary subarrays during merge.',
        best: 'O(n log n)',
        avg: 'O(n log n)',
        worst: 'O(n log n)',
        space: 'O(n)'
    },
    quick: {
        name: 'Quick Sort',
        desc: 'Selects a pivot, partitions the array around it, and recursively sorts sub-arrays.',
        purpose: 'High-performance, general-purpose sorting.',
        usage: 'Default standard libraries sorting (e.g., C++, Java, V8 Engine).',
        strengths: 'Extremely fast in practice. Good cache locality. Performs in-place sorting.',
        limitations: 'Unstable. Worst-case is O(n²) if pivot choices are highly unbalanced.',
        best: 'O(n log n)',
        avg: 'O(n log n)',
        worst: 'O(n²)',
        space: 'O(log n)'
    }
}

// Reusable clean Tooltip Component for contextual help
function Tooltip({ text }) {
    return (
        <span className="relative group inline-flex items-center ml-1">
            <svg 
                className="w-3.5 h-3.5 text-zinc-500 hover:text-[#c5f82a] cursor-help transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0e0e11] border border-[#1a1a22] rounded text-[10px] text-zinc-400 normal-case leading-normal font-sans shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50">
                {text}
            </span>
        </span>
    )
}

const PATHFINDING_SPEED_MAP = {
    fast: 8,
    normal: 30,
    slow: 100
}

const SORTING_SPEED_MAP = {
    fast: 4,
    normal: 35,
    slow: 180
}

export default function AlgorithmVisualizer() {
    const [activeTab, setActiveTab] = useState('pathfinding')
    const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200)

    // Window resize observer
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Dynamic grid dimensions
    const [isComparison, setIsComparison] = useState(false)

    const dimensions = useMemo(() => {
        if (windowWidth < 640) {
            return {
                rows: isComparison ? 8 : 10,
                cols: isComparison ? 10 : 12,
                start: isComparison ? { row: 4, col: 1 } : { row: 5, col: 2 },
                end: isComparison ? { row: 4, col: 8 } : { row: 5, col: 9 }
            }
        } else if (windowWidth < 1024) {
            return {
                rows: isComparison ? 10 : 12,
                cols: isComparison ? 14 : 20,
                start: isComparison ? { row: 5, col: 2 } : { row: 6, col: 3 },
                end: isComparison ? { row: 5, col: 11 } : { row: 6, col: 16 }
            }
        } else {
            return {
                rows: isComparison ? 12 : 16,
                cols: isComparison ? 15 : 30,
                start: isComparison ? { row: 5, col: 2 } : { row: 7, col: 4 },
                end: isComparison ? { row: 5, col: 12 } : { row: 7, col: 25 }
            }
        }
    }, [windowWidth, isComparison])

    // Grids State
    const [grid, setGrid] = useState([])
    const [compareGridA, setCompareGridA] = useState([])
    const [compareGridB, setCompareGridB] = useState([])

    // Re-initialize grids when dimension configuration changes
    const handleClearBoard = useCallback(() => {
        const { start, end, rows, cols } = dimensions
        clearAnimClasses()
        
        if (!isComparison) {
            setGrid(initializeGrid(start, end, false, rows, cols))
            setPfStats({ visited: 0, pathLength: 0, execTime: 0, status: 'Idle' })
        } else {
            setCompareGridA(initializeGrid(start, end, true, rows, cols))
            setCompareGridB(initializeGrid(start, end, true, rows, cols))
            setCompareStats({
                algoA: { visited: 0, pathLength: 0, execTime: 0, status: 'Idle' },
                algoB: { visited: 0, pathLength: 0, execTime: 0, status: 'Idle' }
            })
        }
    }, [dimensions, isComparison])

    useEffect(() => {
        handleClearBoard()
    }, [handleClearBoard])

    // Draggable Wall / Node state variables
    const [mouseIsPressed, setMouseIsPressed] = useState(false)
    const [isMovingStart, setIsMovingStart] = useState(false)
    const [isMovingEnd, setIsMovingEnd] = useState(false)

    // Pathfinding Configuration
    const [pfAlgo, setPfAlgo] = useState('astar')
    const [compareAlgoA, setCompareAlgoA] = useState('astar')
    const [compareAlgoB, setCompareAlgoB] = useState('dijkstra')
    const [pfSpeed, setPfSpeed] = useState('fast')
    const [pfIsRunning, setPfIsRunning] = useState(false)
    
    const [pfStats, setPfStats] = useState({ visited: 0, pathLength: 0, execTime: 0, status: 'Idle' })
    const [compareStats, setCompareStats] = useState({
        algoA: { visited: 0, pathLength: 0, execTime: 0, status: 'Idle' },
        algoB: { visited: 0, pathLength: 0, execTime: 0, status: 'Idle' }
    })

    // Accordion visibility
    const [infoOpen, setInfoOpen] = useState(false)

    useSEO({
        title: 'Algorithm Lab | Gaurav Portfolio',
        description: 'Interactive pathfinding and sorting algorithms explorer built with premium minimalist design.',
        keywords: 'Algorithm visualizer, pathfinding, sorting algorithms, computer science, React',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    // Helper to toggle walls
    const getNewGridWithWallToggled = (currGrid, row, col) => {
        return currGrid.map(r => r.map(n => {
            if (n.row === row && n.col === col && !n.isStart && !n.isEnd) {
                return { ...n, isWall: !n.isWall }
            }
            return n
        }))
    }

    const handleMouseDown = (row, col, isNodeStart, isNodeEnd, gridType = 'single') => {
        if (pfIsRunning) return
        setMouseIsPressed(true)
        if (isNodeStart) {
            setIsMovingStart(true)
        } else if (isNodeEnd) {
            setIsMovingEnd(true)
        } else {
            if (gridType === 'single') {
                setGrid(prev => getNewGridWithWallToggled(prev, row, col))
            } else {
                setCompareGridA(prev => getNewGridWithWallToggled(prev, row, col))
                setCompareGridB(prev => getNewGridWithWallToggled(prev, row, col))
            }
        }
    }

    const handleMouseEnter = (row, col, gridType = 'single') => {
        if (!mouseIsPressed || pfIsRunning) return

        const activeGrid = gridType === 'single' ? grid : compareGridA
        let activeStart = null
        let activeEnd = null

        for (const r of activeGrid) {
            for (const n of r) {
                if (n.isStart) activeStart = { row: n.row, col: n.col }
                if (n.isEnd) activeEnd = { row: n.row, col: n.col }
            }
        }
        if (!activeStart || !activeEnd) return

        if (isMovingStart) {
            if (row === activeEnd.row && col === activeEnd.col) return
            const updateStart = (prevGrid) => prevGrid.map(r => r.map(n => ({
                ...n,
                isStart: n.row === row && n.col === col,
                isWall: n.row === row && n.col === col ? false : n.isWall
            })))
            if (gridType === 'single') {
                setGrid(updateStart)
            } else {
                setCompareGridA(updateStart)
                setCompareGridB(updateStart)
            }
        } else if (isMovingEnd) {
            if (row === activeStart.row && col === activeStart.col) return
            const updateEnd = (prevGrid) => prevGrid.map(r => r.map(n => ({
                ...n,
                isEnd: n.row === row && n.col === col,
                isWall: n.row === row && n.col === col ? false : n.isWall
            })))
            if (gridType === 'single') {
                setGrid(updateEnd)
            } else {
                setCompareGridA(updateEnd)
                setCompareGridB(updateEnd)
            }
        } else {
            if (gridType === 'single') {
                setGrid(prev => getNewGridWithWallToggled(prev, row, col))
            } else {
                setCompareGridA(prev => getNewGridWithWallToggled(prev, row, col))
                setCompareGridB(prev => getNewGridWithWallToggled(prev, row, col))
            }
        }
    }

    const handleMouseUp = () => {
        setMouseIsPressed(false)
        setIsMovingStart(false)
        setIsMovingEnd(false)
    }

    const clearAnimClasses = () => {
        const nodes = document.querySelectorAll('.grid-node')
        nodes.forEach(node => {
            node.classList.remove('node-visited-anim', 'node-shortest-path-anim')
        })
    }

    const handleClearPath = () => {
        if (pfIsRunning) return
        clearAnimClasses()
        const resetPathNodes = (prevGrid) => prevGrid.map(r => r.map(n => ({
            ...n,
            isVisited: false,
            isPath: false,
            distance: Infinity,
            totalDistance: Infinity,
            previousNode: null
        })))

        if (!isComparison) {
            setGrid(resetPathNodes)
            setPfStats({ visited: 0, pathLength: 0, execTime: 0, status: 'Idle' })
        } else {
            setCompareGridA(resetPathNodes)
            setCompareGridB(resetPathNodes)
            setCompareStats({
                algoA: { visited: 0, pathLength: 0, execTime: 0, status: 'Idle' },
                algoB: { visited: 0, pathLength: 0, execTime: 0, status: 'Idle' }
            })
        }
    }

    const handleClearWalls = () => {
        if (pfIsRunning) return
        clearAnimClasses()
        const resetWalls = (prevGrid) => prevGrid.map(r => r.map(n => ({
            ...n,
            isWall: false,
            isVisited: false,
            isPath: false,
            distance: Infinity,
            totalDistance: Infinity,
            previousNode: null
        })))

        if (!isComparison) {
            setGrid(resetWalls)
            setPfStats({ visited: 0, pathLength: 0, execTime: 0, status: 'Idle' })
        } else {
            setCompareGridA(resetWalls)
            setCompareGridB(resetWalls)
            setCompareStats({
                algoA: { visited: 0, pathLength: 0, execTime: 0, status: 'Idle' },
                algoB: { visited: 0, pathLength: 0, execTime: 0, status: 'Idle' }
            })
        }
    }

    const handleGenerateMaze = () => {
        if (pfIsRunning) return
        handleClearWalls()

        const generate = (prevGrid) => prevGrid.map(r => r.map(n => {
            if (n.isStart || n.isEnd) return n
            return { ...n, isWall: Math.random() < 0.3 }
        }))

        if (!isComparison) {
            setGrid(generate)
        } else {
            const mazeA = generate(initializeGrid(dimensions.start, dimensions.end, true, dimensions.rows, dimensions.cols))
            const mazeB = mazeA.map(r => r.map(n => ({ ...n })))
            setCompareGridA(mazeA)
            setCompareGridB(mazeB)
        }
    }

    // Helper to execute pathfinding algorithms
    const runPathfindingAlgo = (algo, grid, startNode, endNode) => {
        if (algo === 'astar') return astar(grid, startNode, endNode)
        if (algo === 'dijkstra') return dijkstra(grid, startNode, endNode)
        if (algo === 'bfs') return bfs(grid, startNode, endNode)
        if (algo === 'dfs') return dfs(grid, startNode, endNode)
        return []
    }

    // Pathfinding animations
    const animatePathfinding = (visitedInOrder, path, stats) => {
        const speed = PATHFINDING_SPEED_MAP[pfSpeed]
        let i = 0

        if (pfIntervalRef.current) clearInterval(pfIntervalRef.current)
        if (pfPathIntervalRef.current) clearInterval(pfPathIntervalRef.current)

        pfIntervalRef.current = setInterval(() => {
            if (i < visitedInOrder.length) {
                const node = visitedInOrder[i]
                if (!node.isStart && !node.isEnd) {
                    const el = document.getElementById(`node-single-${node.row}-${node.col}`)
                    if (el) el.classList.add('node-visited-anim')
                }
                setPfStats(prev => ({ ...prev, visited: i + 1 }))
                i++
            } else {
                clearInterval(pfIntervalRef.current)
                pfIntervalRef.current = null
                let p = 0
                pfPathIntervalRef.current = setInterval(() => {
                    if (p < path.length) {
                        const node = path[p]
                        if (!node.isStart && !node.isEnd) {
                            const el = document.getElementById(`node-single-${node.row}-${node.col}`)
                            if (el) {
                                el.classList.remove('node-visited-anim')
                                el.classList.add('node-shortest-path-anim')
                            }
                        }
                        setPfStats(prev => ({ ...prev, pathLength: p + 1 }))
                        p++
                    } else {
                        clearInterval(pfPathIntervalRef.current)
                        pfPathIntervalRef.current = null
                        setPfIsRunning(false)
                        setPfStats(prev => ({
                            ...prev,
                            execTime: stats.time,
                            status: path.length > 0 ? 'Success' : 'No Path'
                        }))
                    }
                }, speed * 1.5)
            }
        }, speed)
    }

    const animateComparison = (visitedA, pathA, visitedB, pathB, statsA, statsB) => {
        const speed = PATHFINDING_SPEED_MAP[pfSpeed]
        let a = 0
        let b = 0
        let aDone = false
        let bDone = false

        if (pfIntervalRef.current) clearInterval(pfIntervalRef.current)
        if (pfPathIntervalRef.current) clearInterval(pfPathIntervalRef.current)

        pfIntervalRef.current = setInterval(() => {
            const stepA = a < visitedA.length
            const stepB = b < visitedB.length

            if (stepA) {
                const node = visitedA[a]
                if (!node.isStart && !node.isEnd) {
                    const el = document.getElementById(`node-compareA-${node.row}-${node.col}`)
                    if (el) el.classList.add('node-visited-anim')
                }
                setCompareStats(prev => ({ ...prev, algoA: { ...prev.algoA, visited: a + 1 } }))
                a++
            } else {
                aDone = true
            }

            if (stepB) {
                const node = visitedB[b]
                if (!node.isStart && !node.isEnd) {
                    const el = document.getElementById(`node-compareB-${node.row}-${node.col}`)
                    if (el) el.classList.add('node-visited-anim')
                }
                setCompareStats(prev => ({ ...prev, algoB: { ...prev.algoB, visited: b + 1 } }))
                b++
            } else {
                bDone = true
            }

            if (aDone && bDone) {
                clearInterval(pfIntervalRef.current)
                pfIntervalRef.current = null
                let p = 0
                pfPathIntervalRef.current = setInterval(() => {
                    const drawA = p < pathA.length
                    const drawB = p < pathB.length

                    if (drawA) {
                        const node = pathA[p]
                        if (!node.isStart && !node.isEnd) {
                            const el = document.getElementById(`node-compareA-${node.row}-${node.col}`)
                            if (el) {
                                el.classList.remove('node-visited-anim')
                                el.classList.add('node-shortest-path-anim')
                            }
                        }
                        setCompareStats(prev => ({ ...prev, algoA: { ...prev.algoA, pathLength: p + 1 } }))
                    }
                    if (drawB) {
                        const node = pathB[p]
                        if (!node.isStart && !node.isEnd) {
                            const el = document.getElementById(`node-compareB-${node.row}-${node.col}`)
                            if (el) {
                                el.classList.remove('node-visited-anim')
                                el.classList.add('node-shortest-path-anim')
                            }
                        }
                        setCompareStats(prev => ({ ...prev, algoB: { ...prev.algoB, pathLength: p + 1 } }))
                    }

                    p++
                    if (!drawA && !drawB) {
                        clearInterval(pfPathIntervalRef.current)
                        pfPathIntervalRef.current = null
                        setPfIsRunning(false)
                        setCompareStats({
                            algoA: { visited: visitedA.length, pathLength: pathA.length, execTime: statsA.time, status: pathA.length > 0 ? 'Success' : 'No Path' },
                            algoB: { visited: visitedB.length, pathLength: pathB.length, execTime: statsB.time, status: pathB.length > 0 ? 'Success' : 'No Path' }
                        })
                    }
                }, speed * 2)
            }
        }, speed)
    }

    const handleStartPathfinding = () => {
        if (pfIsRunning) return
        handleClearPath()
        setPfIsRunning(true)

        if (!isComparison) {
            const workingGrid = grid.map(r => r.map(n => ({ ...n })))
            let start = null, end = null

            for (const r of workingGrid) {
                for (const n of r) {
                    if (n.isStart) start = n
                    if (n.isEnd) end = n
                }
            }

            if (!start || !end) {
                setPfIsRunning(false)
                return
            }

            const t0 = performance.now()
            const visitedInOrder = runPathfindingAlgo(pfAlgo, workingGrid, start, end)
            const path = getShortestPath(end, workingGrid)
            const t1 = performance.now()

            setPfStats({ visited: 0, pathLength: 0, execTime: 0, status: 'Running...' })
            animatePathfinding(visitedInOrder, path, { time: (t1 - t0).toFixed(2) })
        } else {
            const workingGridA = compareGridA.map(r => r.map(n => ({ ...n })))
            const workingGridB = compareGridB.map(r => r.map(n => ({ ...n })))

            let startA = null, endA = null
            for (const r of workingGridA) {
                for (const n of r) {
                    if (n.isStart) startA = n
                    if (n.isEnd) endA = n
                }
            }
            let startB = null, endB = null
            for (const r of workingGridB) {
                for (const n of r) {
                    if (n.isStart) startB = n
                    if (n.isEnd) endB = n
                }
            }

            if (!startA || !endA || !startB || !endB) {
                setPfIsRunning(false)
                return
            }

            const t0A = performance.now()
            const visitedA = runPathfindingAlgo(compareAlgoA, workingGridA, startA, endA)
            const pathA = getShortestPath(endA, workingGridA)
            const t1A = performance.now()

            const t0B = performance.now()
            const visitedB = runPathfindingAlgo(compareAlgoB, workingGridB, startB, endB)
            const pathB = getShortestPath(endB, workingGridB)
            const t1B = performance.now()

            setCompareStats({
                algoA: { visited: 0, pathLength: 0, execTime: 0, status: 'Running' },
                algoB: { visited: 0, pathLength: 0, execTime: 0, status: 'Running' }
            })

            animateComparison(visitedA, pathA, visitedB, pathB, { time: (t1A - t0A).toFixed(2) }, { time: (t1B - t0B).toFixed(2) })
        }
    }

    // ──────────────────────────────────────────
    // SORTING VISUALIZER STATE & LOGIC
    // ──────────────────────────────────────────
    const [sortAlgo, setSortAlgo] = useState('quick')
    const [arraySize, setArraySize] = useState(30)
    const [sortSpeed, setSortSpeed] = useState('normal')
    const [sortIsRunning, setSortIsRunning] = useState(false)
    const [sortStats, setSortStats] = useState({ comparisons: 0, swaps: 0, arraySize: 30, execTime: 0 })

    const [array, setArray] = useState([])
    const [activeBars, setActiveBars] = useState([])
    const [sortedBars, setSortedBars] = useState([])

    const animStepsRef = useRef([])
    const animIndexRef = useRef(0)
    const animIntervalRef = useRef(null)
    const pfIntervalRef = useRef(null)
    const pfPathIntervalRef = useRef(null)

    useEffect(() => {
        return () => {
            if (animIntervalRef.current) clearInterval(animIntervalRef.current)
            if (pfIntervalRef.current) clearInterval(pfIntervalRef.current)
            if (pfPathIntervalRef.current) clearInterval(pfPathIntervalRef.current)
        }
    }, [])

    const handleGenerateArray = useCallback((size = arraySize) => {
        if (sortIsRunning) return
        resetSortingState()
        const newArray = []
        for (let i = 0; i < size; i++) {
            newArray.push(Math.floor(Math.random() * 85) + 8)
        }
        setArray(newArray)
        setSortStats({ arraySize: size, comparisons: 0, swaps: 0, execTime: 0 })
    }, [arraySize, sortIsRunning])

    useEffect(() => {
        handleGenerateArray()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arraySize])

    const resetSortingState = () => {
        if (animIntervalRef.current) clearInterval(animIntervalRef.current)
        setSortIsRunning(false)
        setActiveBars([])
        setSortedBars([])
        animIndexRef.current = 0
        animStepsRef.current = []
    }

    const handleStartSorting = () => {
        if (sortIsRunning) return
        resetSortingState()
        setSortIsRunning(true)

        const t0 = performance.now()
        let steps = []
        if (sortAlgo === 'bubble') steps = bubbleSortSteps(array)
        if (sortAlgo === 'selection') steps = selectionSortSteps(array)
        if (sortAlgo === 'insertion') steps = insertionSortSteps(array)
        if (sortAlgo === 'merge') steps = mergeSortSteps(array)
        if (sortAlgo === 'quick') steps = quickSortSteps(array)
        const t1 = performance.now()

        setSortStats(prev => ({ ...prev, execTime: (t1 - t0).toFixed(2), comparisons: 0, swaps: 0 }))
        animStepsRef.current = steps
        animateSortingLoop()
    }

    const animateSortingLoop = () => {
        const speed = SORTING_SPEED_MAP[sortSpeed]
        const steps = animStepsRef.current

        animIntervalRef.current = setInterval(() => {
            const idx = animIndexRef.current
            if (idx >= steps.length) {
                clearInterval(animIntervalRef.current)
                setActiveBars([])
                setSortIsRunning(false)
                
                const finalBars = []
                for (let k = 0; k < array.length; k++) finalBars.push(k)
                setSortedBars(finalBars)
                return
            }

            const step = steps[idx]
            if (step.type === 'compare') {
                setActiveBars(step.indices)
                setSortStats(prev => ({ ...prev, comparisons: prev.comparisons + 1 }))
            } else if (step.type === 'swap') {
                setActiveBars(step.indices)
                setArray(prev => {
                    const nextArr = [...prev]
                    nextArr[step.indices[0]] = step.values[0]
                    nextArr[step.indices[1]] = step.values[1]
                    return nextArr
                })
                setSortStats(prev => ({ ...prev, swaps: prev.swaps + 1 }))
            } else if (step.type === 'set') {
                setActiveBars([step.index])
                setArray(prev => {
                    const nextArr = [...prev]
                    nextArr[step.index] = step.value
                    return nextArr
                })
                setSortStats(prev => ({ ...prev, swaps: prev.swaps + 1 }))
            } else if (step.type === 'sorted') {
                setSortedBars(prev => [...new Set([...prev, step.index])])
            }

            animIndexRef.current++
        }, speed)
    }

    const handleResetSorting = () => {
        resetSortingState()
        handleGenerateArray(arraySize)
    }

    return (
        <main 
            className="min-h-screen bg-[#070708] text-zinc-300 font-mono text-xs sm:text-sm p-4 relative overflow-hidden flex flex-col justify-between"
            onMouseUp={handleMouseUp}
        >
            
            {/* Navigation Header */}
            <div className="flex items-center justify-between border-b border-[#1a1a22] pb-3 mb-4 z-10">
                <Link
                    to="/lab"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#c5f82a] text-xs uppercase tracking-wider transition-colors group font-bold"
                >
                    <svg className="group-hover:-translate-x-1 transition-transform duration-200 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Lab
                </Link>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#c5f82a] inline-block animate-pulse"></span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">// Algorithm Lab v1.1</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
                
                {/* Visual Title */}
                <div className="text-center mt-2 mb-5 relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-display font-black uppercase text-white mb-2 tracking-tight flex items-center justify-center gap-2">
                        <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="5" r="2.5" />
                            <circle cx="5" cy="12" r="2.5" />
                            <circle cx="19" cy="12" r="2.5" />
                            <circle cx="12" cy="19" r="2.5" />
                            <line x1="12" y1="7.5" x2="12" y2="16.5" />
                            <line x1="7.25" y1="10.25" x2="16.75" y2="13.75" />
                            <line x1="7.25" y1="13.75" x2="16.75" y2="10.25" />
                        </svg>
                        Algorithm Intelligence Lab
                    </h1>
                    <p className="text-zinc-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                        Watch pathfinding and sorting algorithms operate step-by-step.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-5 relative z-10">
                    <div className="inline-flex p-1 bg-[#0e0e11] border border-[#1a1a22] rounded-lg">
                        <button
                            onClick={() => { if (!pfIsRunning && !sortIsRunning) { setActiveTab('pathfinding'); setInfoOpen(false); } }}
                            disabled={pfIsRunning || sortIsRunning}
                            className={`px-4 sm:px-5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeTab === 'pathfinding'
                                    ? 'bg-[#c5f82a] text-[#070708] shadow-[0_0_12px_rgba(197,248,42,0.15)]'
                                    : 'text-zinc-400 hover:text-white disabled:opacity-40'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            Pathfinding
                        </button>
                        <button
                            onClick={() => { if (!pfIsRunning && !sortIsRunning) { setActiveTab('sorting'); setInfoOpen(false); } }}
                            disabled={pfIsRunning || sortIsRunning}
                            className={`px-4 sm:px-5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                                activeTab === 'sorting'
                                    ? 'bg-[#c5f82a] text-[#070708] shadow-[0_0_12px_rgba(197,248,42,0.15)]'
                                    : 'text-zinc-400 hover:text-white disabled:opacity-40'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                            Sorting
                        </button>
                    </div>
                </div>

                {/* ────────────────────────────────────────── */}
                {/* TAB 1: PATHFINDING VIEW */}
                {/* ────────────────────────────────────────── */}
                {activeTab === 'pathfinding' && (
                    <div className="flex-1 flex flex-col w-full">
                        {/* Minimal Control Row */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 p-4 bg-[#0e0e11] border border-[#1a1a22] rounded-lg mb-4">
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 flex-1">
                                {/* Algo Selector */}
                                {!isComparison && (
                                    <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center">
                                            Algorithm
                                            <Tooltip text="Choose a pathfinding strategy. A* uses heuristics, Dijkstra is radial search, BFS is layer-by-layer, DFS explores deep." />
                                        </span>
                                        <select
                                            value={pfAlgo}
                                            onChange={(e) => setPfAlgo(e.target.value)}
                                            disabled={pfIsRunning}
                                            className="w-full bg-[#070708] border border-[#1a1a22] text-white px-3 py-2 rounded text-xs font-bold outline-none cursor-pointer focus:border-[#c5f82a] transition-all"
                                        >
                                            <option value="astar">A* Search</option>
                                            <option value="dijkstra">Dijkstra</option>
                                            <option value="bfs">BFS (Shortest Path)</option>
                                            <option value="dfs">DFS</option>
                                        </select>
                                    </div>
                                )}

                                {/* Speed Selector */}
                                <div className="flex flex-col gap-1.5 min-w-[100px]">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center">
                                        Speed
                                        <Tooltip text="Adjust the visualization delay. Fast (8ms) is best for large grids. Slow (100ms) helps trace step-by-step." />
                                    </span>
                                    <select
                                        value={pfSpeed}
                                        onChange={(e) => setPfSpeed(e.target.value)}
                                        disabled={pfIsRunning}
                                        className="w-full bg-[#070708] border border-[#1a1a22] text-white px-3 py-2 rounded text-xs font-bold outline-none cursor-pointer focus:border-[#c5f82a]"
                                    >
                                        <option value="slow">Slow</option>
                                        <option value="normal">Normal</option>
                                        <option value="fast">Fast</option>
                                    </select>
                                </div>

                                {/* Comparison Mode toggler */}
                                <div className="flex items-center gap-1.5 col-span-2 sm:col-auto">
                                    <button
                                        onClick={() => setIsComparison(!isComparison)}
                                        disabled={pfIsRunning}
                                        className={`h-[34px] px-4 rounded text-xs font-bold uppercase tracking-wider border transition-all w-full ${
                                            isComparison
                                                ? 'bg-[#ff5d00]/10 border-[#ff5d00] text-[#ff5d00]'
                                                : 'bg-[#070708] border-[#1a1a22] text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {isComparison ? 'Single Mode' : 'Compare Options'}
                                    </button>
                                    <Tooltip text="Compare the search patterns, execution times, and paths of two algorithms side-by-side on the same grid." />
                                </div>
                            </div>

                            {/* Core Action Trigger buttons */}
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end mt-2 md:mt-0">
                                <div className="flex items-center gap-1.5 flex-1 md:flex-none">
                                    <button
                                        onClick={handleGenerateMaze}
                                        disabled={pfIsRunning}
                                        className="w-full bg-[#070708] border border-[#1a1a22] text-zinc-400 hover:text-white px-4 h-[36px] rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v6M15 9v6M9 15v6" />
                                        </svg>
                                        Maze
                                    </button>
                                    <Tooltip text="Generate a randomized grid of walls using a 30% fill threshold." />
                                </div>
                                <button
                                    onClick={handleClearWalls}
                                    disabled={pfIsRunning}
                                    className="flex-1 md:flex-none bg-[#070708] border border-[#1a1a22] text-zinc-400 hover:text-white px-4 h-[36px] rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    Clear Walls
                                </button>
                                <button
                                    onClick={handleClearBoard}
                                    disabled={pfIsRunning}
                                    className="flex-1 md:flex-none bg-[#070708] border border-[#1a1a22] text-zinc-400 hover:text-red-400 px-4 h-[36px] rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><polyline points="3 3 3 8 8 8" />
                                    </svg>
                                    Reset
                                </button>
                                <button
                                    onClick={handleStartPathfinding}
                                    disabled={pfIsRunning}
                                    className="flex-[2] md:flex-none bg-[#c5f82a] text-[#070708] hover:bg-white px-6 h-[36px] rounded text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-[#c5f82a] flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    {pfIsRunning ? 'Searching' : 'Visualize'}
                                </button>
                            </div>
                        </div>

                        {/* Node Legend indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-zinc-500 mb-4 font-mono font-semibold uppercase tracking-wider bg-[#0e0e11]/40 py-2 rounded-lg border border-[#1a1a22]">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                <span>Start</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#ff5d00] inline-block"></span>
                                <span>Target</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block"></span>
                                <span>Wall</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#c5f82a]/30 inline-block"></span>
                                <span>Searched</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#c5f82a] inline-block"></span>
                                <span>Path</span>
                            </div>
                        </div>

                        {/* Grid Canvas Section */}
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 mb-4">
                            {!isComparison ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#0e0e11] border border-[#1a1a22] rounded-lg overflow-hidden">
                                    <div 
                                        className="grid select-none bg-zinc-950/70 p-1.5 rounded border border-zinc-900"
                                        style={{
                                            gridTemplateColumns: `repeat(${grid[0]?.length || 30}, minmax(13px, 1fr))`,
                                            width: 'fit-content'
                                        }}
                                    >
                                        {grid.map((row, rIdx) =>
                                            row.map((node, cIdx) => {
                                                const { isStart, isEnd, isWall } = node
                                                let bgClass = 'bg-[#070708] border-zinc-900/60'
                                                if (isStart) bgClass = 'bg-emerald-500 scale-105 rounded-full'
                                                if (isEnd) bgClass = 'bg-[#ff5d00] scale-105'
                                                if (isWall) bgClass = 'bg-zinc-700 border-zinc-700'

                                                return (
                                                    <div
                                                        key={`node-${rIdx}-${cIdx}`}
                                                        id={`node-single-${rIdx}-${cIdx}`}
                                                        onMouseDown={() => handleMouseDown(rIdx, cIdx, isStart, isEnd, 'single')}
                                                        onMouseEnter={() => handleMouseEnter(rIdx, cIdx, 'single')}
                                                        className={`grid-node w-[14px] sm:w-[22px] h-[14px] sm:h-[22px] border-[0.5px] cursor-crosshair transition-all duration-300 ${bgClass}`}
                                                    />
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Side-by-Side Dual grids */
                                <div className="flex-1 flex flex-col md:flex-row gap-4">
                                    {/* Grid A */}
                                    <div className="flex-1 flex flex-col p-4 bg-[#0e0e11] border border-[#1a1a22] rounded-lg">
                                        <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#1a1a22]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-zinc-500 font-bold text-[10px] uppercase font-mono">Grid A:</span>
                                                <select
                                                    value={compareAlgoA}
                                                    onChange={(e) => setCompareAlgoA(e.target.value)}
                                                    disabled={pfIsRunning}
                                                    className="bg-[#070708] border border-[#1a1a22] text-white px-2 py-0.5 rounded text-[11px] font-bold outline-none cursor-pointer focus:border-[#c5f82a] transition-all"
                                                >
                                                    <option value="astar">A* Search</option>
                                                    <option value="dijkstra">Dijkstra</option>
                                                    <option value="bfs">BFS</option>
                                                    <option value="dfs">DFS</option>
                                                </select>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-mono">{compareStats.algoA.execTime} ms</span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center overflow-hidden py-2">
                                            <div 
                                                className="grid select-none bg-zinc-950/70 p-1.5 rounded border border-zinc-900"
                                                style={{
                                                    gridTemplateColumns: `repeat(${compareGridA[0]?.length || 15}, minmax(13px, 1fr))`,
                                                    width: 'fit-content'
                                                }}
                                            >
                                                {compareGridA.map((row, rIdx) =>
                                                    row.map((node, cIdx) => {
                                                        const { isStart, isEnd, isWall } = node
                                                        let bgClass = 'bg-[#070708] border-zinc-900/60'
                                                        if (isStart) bgClass = 'bg-emerald-500 rounded-full scale-105'
                                                        if (isEnd) bgClass = 'bg-[#ff5d00] scale-105'
                                                        if (isWall) bgClass = 'bg-zinc-700 border-zinc-700'

                                                        return (
                                                            <div
                                                                key={`compA-${rIdx}-${cIdx}`}
                                                                id={`node-compareA-${rIdx}-${cIdx}`}
                                                                onMouseDown={() => handleMouseDown(rIdx, cIdx, isStart, isEnd, 'compare')}
                                                                onMouseEnter={() => handleMouseEnter(rIdx, cIdx, 'compare')}
                                                                className={`grid-node w-[14px] sm:w-[20px] h-[14px] sm:h-[20px] border-[0.5px] cursor-crosshair transition-all duration-300 ${bgClass}`}
                                                            />
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 font-mono bg-zinc-950 p-2 rounded mt-2">
                                            <div>Visited: <span className="text-white font-bold">{compareStats.algoA.visited}</span></div>
                                            <div>Path: <span className="text-white font-bold">{compareStats.algoA.pathLength}</span></div>
                                        </div>
                                    </div>

                                    {/* Grid B */}
                                    <div className="flex-1 flex flex-col p-4 bg-[#0e0e11] border border-[#1a1a22] rounded-lg">
                                        <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#1a1a22]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-zinc-500 font-bold text-[10px] uppercase font-mono">Grid B:</span>
                                                <select
                                                    value={compareAlgoB}
                                                    onChange={(e) => setCompareAlgoB(e.target.value)}
                                                    disabled={pfIsRunning}
                                                    className="bg-[#070708] border border-[#1a1a22] text-white px-2 py-0.5 rounded text-[11px] font-bold outline-none cursor-pointer focus:border-[#c5f82a] transition-all"
                                                >
                                                    <option value="astar">A* Search</option>
                                                    <option value="dijkstra">Dijkstra</option>
                                                    <option value="bfs">BFS</option>
                                                    <option value="dfs">DFS</option>
                                                </select>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-mono">{compareStats.algoB.execTime} ms</span>
                                        </div>
                                        <div className="flex-1 flex items-center justify-center overflow-hidden py-2">
                                            <div 
                                                className="grid select-none bg-zinc-950/70 p-1.5 rounded border border-zinc-900"
                                                style={{
                                                    gridTemplateColumns: `repeat(${compareGridB[0]?.length || 15}, minmax(13px, 1fr))`,
                                                    width: 'fit-content'
                                                }}
                                            >
                                                {compareGridB.map((row, rIdx) =>
                                                    row.map((node, cIdx) => {
                                                        const { isStart, isEnd, isWall } = node
                                                        let bgClass = 'bg-[#070708] border-zinc-900/60'
                                                        if (isStart) bgClass = 'bg-emerald-500 rounded-full scale-105'
                                                        if (isEnd) bgClass = 'bg-[#ff5d00] scale-105'
                                                        if (isWall) bgClass = 'bg-zinc-700 border-zinc-700'

                                                        return (
                                                            <div
                                                                key={`compB-${rIdx}-${cIdx}`}
                                                                id={`node-compareB-${rIdx}-${cIdx}`}
                                                                onMouseDown={() => handleMouseDown(rIdx, cIdx, isStart, isEnd, 'compare')}
                                                                onMouseEnter={() => handleMouseEnter(rIdx, cIdx, 'compare')}
                                                                className={`grid-node w-[14px] sm:w-[20px] h-[14px] sm:h-[20px] border-[0.5px] cursor-crosshair transition-all duration-300 ${bgClass}`}
                                                            />
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 font-mono bg-zinc-950 p-2 rounded mt-2">
                                            <div>Visited: <span className="text-white font-bold">{compareStats.algoB.visited}</span></div>
                                            <div>Path: <span className="text-white font-bold">{compareStats.algoB.pathLength}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Single Stats Panel */}
                            {!isComparison && (
                                <div className="w-full lg:w-[220px] flex flex-col gap-3">
                                    <div className="bg-[#0e0e11] border border-[#1a1a22] p-4 rounded-lg">
                                        <span className="text-white font-bold text-xs uppercase tracking-wider block mb-3 pb-2 border-b border-[#1a1a22]">// Statistics</span>
                                        <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                            <li className="flex justify-between">
                                                <span>Visited:</span>
                                                <span className="text-white font-bold">{pfStats.visited}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Path Nodes:</span>
                                                <span className="text-white font-bold">{pfStats.pathLength}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Execution:</span>
                                                <span className="text-white font-bold">{pfStats.execTime} ms</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Status:</span>
                                                <span className="text-[#c5f82a] font-bold uppercase">{pfStats.status}</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="bg-[#0e0e11] border border-[#1a1a22] p-4 rounded-lg flex-1 text-xs text-zinc-500 leading-relaxed font-mono">
                                        <span className="text-[#c5f82a] font-bold block mb-1">DRAG INSTRUCTION:</span>
                                        Click and drag the green circle or red square nodes to dynamically set coordinates. Drag empty cells to place custom walls.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* About this algorithm panel */}
                        <div className="bg-[#0e0e11] border border-[#1a1a22] rounded-lg mb-4">
                            <button
                                onClick={() => setInfoOpen(!infoOpen)}
                                className="w-full flex items-center justify-between p-4 font-bold text-xs uppercase tracking-wider text-white border-b border-[#1a1a22]/30 hover:bg-[#16161a]"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                    About This Algorithm
                                </span>
                                <span>{infoOpen ? 'Close' : 'Expand'}</span>
                            </button>
                            {infoOpen && (
                                <div className="p-4 border-t border-[#1a1a22]/30">
                                    {!isComparison ? (
                                        <div className="grid gap-4 md:grid-cols-2 text-xs font-mono text-zinc-400 leading-relaxed">
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-[#c5f82a] font-bold block mb-1">// Description</span>
                                                    <p className="text-zinc-300 font-sans text-xs">{PATHFINDING_LEARNING_DATA[pfAlgo]?.desc}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[#c5f82a] font-bold block mb-1">// Core Purpose</span>
                                                    <p className="text-zinc-300 font-sans text-xs">{PATHFINDING_LEARNING_DATA[pfAlgo]?.purpose}</p>
                                                </div>
                                                <div>
                                                    <span className="text-white font-bold block mb-1">// Real-world Usage</span>
                                                    <p className="text-zinc-300 font-sans text-xs">{PATHFINDING_LEARNING_DATA[pfAlgo]?.usage}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-emerald-400 font-bold block mb-1">// Strengths & Advantages</span>
                                                    <ul className="list-disc list-inside text-zinc-300 font-sans text-xs space-y-1">
                                                        {PATHFINDING_LEARNING_DATA[pfAlgo]?.strengths.split('. ').map((s, idx) => s && <li key={idx}>{s.trim()}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <span className="text-red-400 font-bold block mb-1">// Limitations</span>
                                                    <ul className="list-disc list-inside text-zinc-300 font-sans text-xs space-y-1">
                                                        {PATHFINDING_LEARNING_DATA[pfAlgo]?.limitations.split('. ').map((s, idx) => s && <li key={idx}>{s.trim()}</li>)}
                                                    </ul>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950 rounded border border-zinc-900 mt-2">
                                                    <div>
                                                        <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold block">Time Complexity</span>
                                                        <span className="text-white font-bold block mt-0.5 text-xs">{PATHFINDING_LEARNING_DATA[pfAlgo]?.time}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold block">Space Complexity</span>
                                                        <span className="text-[#ff5d00] font-bold block mt-0.5 text-xs">{PATHFINDING_LEARNING_DATA[pfAlgo]?.space}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6 md:grid-cols-2 text-xs font-mono text-zinc-400 leading-relaxed">
                                            {/* Algo A Info */}
                                            <div className="p-3 bg-zinc-950/40 rounded border border-zinc-900">
                                                <span className="text-white font-bold text-sm uppercase tracking-wider block mb-2">{PATHFINDING_LEARNING_DATA[compareAlgoA]?.name}</span>
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-[#c5f82a] font-bold block text-[10px]">// Description</span>
                                                        <p className="text-zinc-300 font-sans text-xs">{PATHFINDING_LEARNING_DATA[compareAlgoA]?.desc}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-emerald-400 font-bold block text-[10px]">// Strengths</span>
                                                        <p className="text-zinc-300 font-sans text-xs">{PATHFINDING_LEARNING_DATA[compareAlgoA]?.strengths}</p>
                                                    </div>
                                                    <div className="flex gap-4 mt-2 pt-2 border-t border-zinc-900">
                                                        <div>Time: <span className="text-white font-bold">{PATHFINDING_LEARNING_DATA[compareAlgoA]?.time}</span></div>
                                                        <div>Space: <span className="text-[#ff5d00] font-bold">{PATHFINDING_LEARNING_DATA[compareAlgoA]?.space}</span></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Algo B Info */}
                                            <div className="p-3 bg-zinc-950/40 rounded border border-zinc-900">
                                                <span className="text-white font-bold text-sm uppercase tracking-wider block mb-2">{PATHFINDING_LEARNING_DATA[compareAlgoB]?.name}</span>
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-[#c5f82a] font-bold block text-[10px]">// Description</span>
                                                        <p className="text-zinc-300 font-sans text-xs">{PATHFINDING_LEARNING_DATA[compareAlgoB]?.desc}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-emerald-400 font-bold block text-[10px]">// Strengths</span>
                                                        <p className="text-zinc-300 font-sans text-xs">{PATHFINDING_LEARNING_DATA[compareAlgoB]?.strengths}</p>
                                                    </div>
                                                    <div className="flex gap-4 mt-2 pt-2 border-t border-zinc-900">
                                                        <div>Time: <span className="text-white font-bold">{PATHFINDING_LEARNING_DATA[compareAlgoB]?.time}</span></div>
                                                        <div>Space: <span className="text-[#ff5d00] font-bold">{PATHFINDING_LEARNING_DATA[compareAlgoB]?.space}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ────────────────────────────────────────── */}
                {/* TAB 2: SORTING VIEW */}
                {/* ────────────────────────────────────────── */}
                {activeTab === 'sorting' && (
                    <div className="flex-1 flex flex-col w-full">
                        {/* Minimal Control Row */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 p-4 bg-[#0e0e11] border border-[#1a1a22] rounded-lg mb-4">
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 flex-1">
                                {/* Algo Selector */}
                                <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center">
                                        Algorithm
                                        <Tooltip text="Choose a sorting strategy. Quick and Merge sort run in O(n log n). Bubble, Selection, and Insertion run in O(n²)." />
                                    </span>
                                    <select
                                        value={sortAlgo}
                                        onChange={(e) => setSortAlgo(e.target.value)}
                                        disabled={sortIsRunning}
                                        className="w-full bg-[#070708] border border-[#1a1a22] text-white px-3 py-2 rounded text-xs font-bold outline-none cursor-pointer focus:border-[#c5f82a] transition-all"
                                    >
                                        <option value="quick">Quick Sort</option>
                                        <option value="merge">Merge Sort</option>
                                        <option value="bubble">Bubble Sort</option>
                                        <option value="selection">Selection Sort</option>
                                        <option value="insertion">Insertion Sort</option>
                                    </select>
                                </div>

                                {/* Speed Selector */}
                                <div className="flex flex-col gap-1.5 min-w-[100px]">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center">
                                        Speed
                                        <Tooltip text="Adjust the visualization delay. Fast (4ms) is best for large arrays. Slow (180ms) helps trace swaps." />
                                    </span>
                                    <select
                                        value={sortSpeed}
                                        onChange={(e) => setSortSpeed(e.target.value)}
                                        className="w-full bg-[#070708] border border-[#1a1a22] text-white px-3 py-2 rounded text-xs font-bold outline-none cursor-pointer focus:border-[#c5f82a]"
                                    >
                                        <option value="slow">Slow</option>
                                        <option value="normal">Normal</option>
                                        <option value="fast">Fast</option>
                                    </select>
                                </div>

                                {/* Size Slider */}
                                <div className="flex flex-col gap-1.5 min-w-[140px] col-span-2 sm:col-auto flex-1">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center">
                                        Array Size: {arraySize}
                                        <Tooltip text="Change the number of elements in the array to sort (ranging from 15 to 75)." />
                                    </span>
                                    <input
                                        type="range"
                                        min="15"
                                        max="75"
                                        value={arraySize}
                                        disabled={sortIsRunning}
                                        onChange={(e) => setArraySize(Number(e.target.value))}
                                        className="accent-[#c5f82a] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer w-full mt-2"
                                    />
                                </div>
                            </div>

                            {/* Core Action Trigger buttons */}
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end mt-2 md:mt-0">
                                <button
                                    onClick={() => handleGenerateArray(arraySize)}
                                    disabled={sortIsRunning}
                                    className="flex-1 md:flex-none bg-[#070708] border border-[#1a1a22] text-zinc-400 hover:text-white px-4 h-[36px] rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 1 1 21.27 8H18" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Generate
                                </button>
                                <button
                                    onClick={handleResetSorting}
                                    className="flex-1 md:flex-none bg-[#070708] border border-[#1a1a22] text-zinc-400 hover:text-red-400 px-4 h-[36px] rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><polyline points="3 3 3 8 8 8" />
                                    </svg>
                                    Reset
                                </button>
                                <button
                                    onClick={handleStartSorting}
                                    disabled={sortIsRunning}
                                    className="flex-[2] md:flex-none bg-[#c5f82a] text-[#070708] hover:bg-white px-6 h-[36px] rounded text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-[#c5f82a] flex items-center justify-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                    {sortIsRunning ? 'Sorting' : 'Start'}
                                </button>
                            </div>
                        </div>

                        {/* Array and stats side by side */}
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 mb-4">
                            {/* Bar Chart Area */}
                            <div className="flex-1 min-h-[250px] flex items-end justify-center p-5 bg-[#0e0e11] border border-[#1a1a22] rounded-lg">
                                <div className="w-full h-full flex items-end justify-center gap-[2px] sm:gap-[3px] relative max-w-4xl">
                                    {array.map((value, idx) => {
                                        let barColor = 'bg-zinc-800'
                                        if (activeBars.includes(idx)) {
                                            barColor = 'bg-[#ff5d00] shadow-[0_0_8px_#ff5d00]'
                                        } else if (sortedBars.includes(idx)) {
                                            barColor = 'bg-[#c5f82a]'
                                        }

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex-1 rounded-t transition-all ${barColor}`}
                                                style={{
                                                    height: `${value}%`,
                                                    minWidth: '2px'
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Stats Panel */}
                            <div className="w-full lg:w-[220px] flex flex-col gap-3">
                                <div className="bg-[#0e0e11] border border-[#1a1a22] p-4 rounded-lg">
                                    <span className="text-white font-bold text-xs uppercase tracking-wider block mb-3 pb-2 border-b border-[#1a1a22]">// Statistics</span>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex justify-between">
                                            <span>Comparisons:</span>
                                            <span className="text-white font-bold">{sortStats.comparisons}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Swaps/Sets:</span>
                                            <span className="text-white font-bold">{sortStats.swaps}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Array Elements:</span>
                                            <span className="text-white font-bold">{sortStats.arraySize}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Duration:</span>
                                            <span className="text-white font-bold">{sortStats.execTime} ms</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-[#0e0e11] border border-[#1a1a22] p-4 rounded-lg font-mono text-[10px] text-zinc-500 space-y-2">
                                    <span className="text-white font-bold uppercase tracking-wider block">// Legend</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 bg-zinc-800 rounded-sm inline-block"></span>
                                        <span>Unsorted items</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 bg-[#ff5d00] rounded-sm inline-block"></span>
                                        <span>Comparing / Active</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 bg-[#c5f82a] rounded-sm inline-block"></span>
                                        <span>Sorted items</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Collapsible About Accordion */}
                        <div className="bg-[#0e0e11] border border-[#1a1a22] rounded-lg mb-4">
                            <button
                                onClick={() => setInfoOpen(!infoOpen)}
                                className="w-full flex items-center justify-between p-4 font-bold text-xs uppercase tracking-wider text-white border-b border-[#1a1a22]/30 hover:bg-[#16161a]"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                    About This Algorithm
                                </span>
                                <span>{infoOpen ? 'Close' : 'Expand'}</span>
                            </button>
                            {infoOpen && (
                                <div className="p-4 grid gap-4 md:grid-cols-2 text-xs font-mono text-zinc-400 leading-relaxed border-t border-[#1a1a22]/30">
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-[#c5f82a] font-bold block mb-1">// Description</span>
                                            <p className="text-zinc-300 font-sans text-xs">{SORTING_LEARNING_DATA[sortAlgo]?.desc}</p>
                                        </div>
                                        <div>
                                            <span className="text-[#c5f82a] font-bold block mb-1">// Core Purpose</span>
                                            <p className="text-zinc-300 font-sans text-xs">{SORTING_LEARNING_DATA[sortAlgo]?.purpose}</p>
                                        </div>
                                        <div>
                                            <span className="text-white font-bold block mb-1">// Real-world Usage</span>
                                            <p className="text-zinc-300 font-sans text-xs">{SORTING_LEARNING_DATA[sortAlgo]?.usage}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-emerald-400 font-bold block mb-1">// Strengths & Advantages</span>
                                            <ul className="list-disc list-inside text-zinc-300 font-sans text-xs space-y-1">
                                                {SORTING_LEARNING_DATA[sortAlgo]?.strengths.split('. ').map((s, idx) => s && <li key={idx}>{s.trim()}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <span className="text-red-400 font-bold block mb-1">// Limitations</span>
                                            <ul className="list-disc list-inside text-zinc-300 font-sans text-xs space-y-1">
                                                {SORTING_LEARNING_DATA[sortAlgo]?.limitations.split('. ').map((s, idx) => s && <li key={idx}>{s.trim()}</li>)}
                                            </ul>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950 rounded border border-zinc-900 mt-2">
                                            <div className="col-span-2 grid grid-cols-3 gap-2">
                                                <div>
                                                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold block">Best</span>
                                                    <span className="text-white font-bold block mt-0.5 text-xs">{SORTING_LEARNING_DATA[sortAlgo]?.best}</span>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold block">Average</span>
                                                    <span className="text-white font-bold block mt-0.5 text-xs">{SORTING_LEARNING_DATA[sortAlgo]?.avg}</span>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold block">Worst</span>
                                                    <span className="text-white font-bold block mt-0.5 text-xs">{SORTING_LEARNING_DATA[sortAlgo]?.worst}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 border-t border-zinc-900 pt-2 mt-1">
                                                <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold block">Space Complexity</span>
                                                <span className="text-[#ff5d00] font-bold block mt-0.5 text-xs">{SORTING_LEARNING_DATA[sortAlgo]?.space}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
