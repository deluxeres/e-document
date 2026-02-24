'use strict'

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"

export function Provider(props) {
    return (
        <ChakraProvider value={defaultSystem}>
            {props.children}
        </ChakraProvider>
    )
}