import { Button } from 'antd'
import { ConfigProvider } from "@ant-design/icons"
const lazy = import('antd/es/button')
const cjs = require('antd')

export function Probe() {
  void lazy
  void cjs
  return [Button, ConfigProvider]
}
