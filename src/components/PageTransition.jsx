import { motion } from 'framer-motion'

const variants = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -12 },
}

export default function PageTransition({ children }) {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    )
}
