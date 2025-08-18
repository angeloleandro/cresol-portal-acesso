# components > Card
  
  URL: docs/components/card
  Source: https://raw.githubusercontent.com/chakra-ui/chakra-ui/refs/heads/main/apps/www/content/docs/components/card.mdx
  
  Used to display content related to a single subject.
          
  ***
  
  title: Card
  description: Used to display content related to a single subject.
  links: 
 - source: https://github.com/chakra-ui/chakra-ui/tree/main/packages/react/src/components/card
 - storybook: https://storybook.chakra-ui.com/?path=/story/components-card--basic
 - recipe: https://github.com/chakra-ui/chakra-ui/tree/main/packages/react/src/theme/recipes/card.ts
  ------------------------------------------------------------------------------------------------
  
  ```tsx
import { Avatar, Button, Card } from "@chakra-ui/react"

export const CardBasic = () => {
  return (
    <Card.Root width="320px">
      <Card.Body gap="2">
        <Avatar.Root size="lg" shape="rounded">
          <Avatar.Image src="https://picsum.photos/200/300" />
          <Avatar.Fallback name="Nue Camp" />
        </Avatar.Root>
        <Card.Title mt="2">Nue Camp</Card.Title>
        <Card.Description>
          This is the card body. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Curabitur nec odio vel dui euismod fermentum.
          Curabitur nec odio vel dui euismod fermentum.
        </Card.Description>
      </Card.Body>
      <Card.Footer justifyContent="flex-end">
        <Button variant="outline">View</Button>
        <Button>Join</Button>
      </Card.Footer>
    </Card.Root>
  )
}

```

## Usage

```jsx
import { Card } from "@chakra-ui/react"
```

```jsx
<Card.Root>
  <Card.Header />
  <Card.Body />
  <Card.Footer />
</Card.Root>
```

## Examples

### Variants

Use the `variant` prop to change the visual style of the Card.

```tsx
import { Avatar, Button, Card, For, Stack } from "@chakra-ui/react"

export const CardWithVariants = () => {
  return (
    <Stack gap="4" direction="row" wrap="wrap">
      <For each={["subtle", "outline", "elevated"]}>
        {(variant) => (
          <Card.Root width="320px" variant={variant} key={variant}>
            <Card.Body gap="2">
              <Avatar.Root size="lg" shape="rounded">
                <Avatar.Image src="https://picsum.photos/200/300" />
                <Avatar.Fallback name="Nue Camp" />
              </Avatar.Root>
              <Card.Title mb="2">Nue Camp</Card.Title>
              <Card.Description>
                This is the card body. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit.
              </Card.Description>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
              <Button variant="outline">View</Button>
              <Button>Join</Button>
            </Card.Footer>
          </Card.Root>
        )}
      </For>
    </Stack>
  )
}

```

### Within Form

Use the Card component within a form to group related fields together.

```tsx
import { Button, Card, Field, Input, Stack } from "@chakra-ui/react"

export const CardWithForm = () => (
  <Card.Root maxW="sm">
    <Card.Header>
      <Card.Title>Sign up</Card.Title>
      <Card.Description>
        Fill in the form below to create an account
      </Card.Description>
    </Card.Header>
    <Card.Body>
      <Stack gap="4" w="full">
        <Field.Root>
          <Field.Label>First Name</Field.Label>
          <Input />
        </Field.Root>
        <Field.Root>
          <Field.Label>Last Name</Field.Label>
          <Input />
        </Field.Root>
      </Stack>
    </Card.Body>
    <Card.Footer justifyContent="flex-end">
      <Button variant="outline">Cancel</Button>
      <Button variant="solid">Sign in</Button>
    </Card.Footer>
  </Card.Root>
)

```

### Sizes

Use the `size` prop to change the size of the Card.

```tsx
import { Card, Heading, Stack } from "@chakra-ui/react"

export const CardWithSizes = () => {
  return (
    <Stack>
      <Card.Root size="sm">
        <Card.Header>
          <Heading size="md"> Card - sm</Heading>
        </Card.Header>
        <Card.Body color="fg.muted">
          This is the card body. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </Card.Body>
      </Card.Root>

      <Card.Root size="md">
        <Card.Header>
          <Heading size="md"> Card - md</Heading>
        </Card.Header>
        <Card.Body color="fg.muted">
          This is the card body. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </Card.Body>
      </Card.Root>

      <Card.Root size="lg">
        <Card.Header>
          <Heading size="md"> Card - lg</Heading>
        </Card.Header>
        <Card.Body color="fg.muted">
          This is the card body. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

```

### With Image

Use the Card component to display an image.

```tsx
import { Button, Card, Image, Text } from "@chakra-ui/react"

export const CardWithImage = () => {
  return (
    <Card.Root maxW="sm" overflow="hidden">
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
        alt="Green double couch with wooden legs"
      />
      <Card.Body gap="2">
        <Card.Title>Living room Sofa</Card.Title>
        <Card.Description>
          This sofa is perfect for modern tropical spaces, baroque inspired
          spaces.
        </Card.Description>
        <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight" mt="2">
          $450
        </Text>
      </Card.Body>
      <Card.Footer gap="2">
        <Button variant="solid">Buy now</Button>
        <Button variant="ghost">Add to cart</Button>
      </Card.Footer>
    </Card.Root>
  )
}

```

### Horizontal

Use the Card component to display content horizontally.

```tsx
import { Badge, Box, Button, Card, HStack, Image } from "@chakra-ui/react"

export const CardHorizontal = () => (
  <Card.Root flexDirection="row" overflow="hidden" maxW="xl">
    <Image
      objectFit="cover"
      maxW="200px"
      src="https://images.unsplash.com/photo-1667489022797-ab608913feeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=800&q=60"
      alt="Caffe Latte"
    />
    <Box>
      <Card.Body>
        <Card.Title mb="2">The perfect latte</Card.Title>
        <Card.Description>
          Caffè latte is a coffee beverage of Italian origin made with espresso
          and steamed milk.
        </Card.Description>
        <HStack mt="4">
          <Badge>Hot</Badge>
          <Badge>Caffeine</Badge>
        </HStack>
      </Card.Body>
      <Card.Footer>
        <Button>Buy Latte</Button>
      </Card.Footer>
    </Box>
  </Card.Root>
)

```

### With Avatar

Use the Card component to display an avatar.

```tsx
import {
  Avatar,
  Button,
  Card,
  HStack,
  Stack,
  Strong,
  Text,
} from "@chakra-ui/react"
import { LuCheck, LuX } from "react-icons/lu"

export const CardWithAvatar = () => {
  return (
    <Card.Root width="320px">
      <Card.Body>
        <HStack mb="6" gap="3">
          <Avatar.Root>
            <Avatar.Image src="https://images.unsplash.com/photo-1511806754518-53bada35f930" />
            <Avatar.Fallback name="Nate Foss" />
          </Avatar.Root>
          <Stack gap="0">
            <Text fontWeight="semibold" textStyle="sm">
              Nate Foss
            </Text>
            <Text color="fg.muted" textStyle="sm">
              @natefoss
            </Text>
          </Stack>
        </HStack>
        <Card.Description>
          <Strong color="fg">Nate Foss </Strong>
          has requested to join your team. You can approve or decline their
          request.
        </Card.Description>
      </Card.Body>
      <Card.Footer>
        <Button variant="subtle" colorPalette="red" flex="1">
          <LuX />
          Decline
        </Button>
        <Button variant="subtle" colorPalette="blue" flex="1">
          <LuCheck />
          Approve
        </Button>
      </Card.Footer>
    </Card.Root>
  )
}

```

## Props

### Root

| Prop | Default | Type | Description |
| --- | --- | --- | --- |
| colorPalette | gray | `'gray' \| 'red' \| 'orange' \| 'yellow' \| 'green' \| 'teal' \| 'blue' \| 'cyan' \| 'purple' \| 'pink'` | The color palette of the component |
| size | md | `'sm' \| 'md' \| 'lg'` | The size of the component |
| variant | outline | `'elevated' \| 'outline' \| 'subtle'` | The variant of the component |
| as | undefined | `React.ElementType` | The underlying element to render. |
| asChild | undefined | `boolean` | Use the provided child element as the default rendered element, combining their props and behavior. |
| unstyled | undefined | `boolean` | Whether to remove the component's style. |
