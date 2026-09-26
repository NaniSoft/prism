import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar, AvatarFallback, AvatarImage } from './avatar'

describe('Avatar', () => {
  it('shows the fallback while the image is unavailable', () => {
    render(
      <Avatar>
        <AvatarImage src="/ada.png" alt="Ada Lovelace" />
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('AD')).toBeInTheDocument()
  })
})
