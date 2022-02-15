import { refreshGlobalMock } from './mock'

// 先进行环境 mock
refreshGlobalMock()
// 然后在每次测试用例执行前重置 mock 环境
beforeEach(refreshGlobalMock)