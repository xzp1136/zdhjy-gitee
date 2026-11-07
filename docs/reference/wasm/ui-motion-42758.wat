  (func (;42758;) (type 1) (param i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4366204
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3408108
      call 2180
      i32.const 3465952
      call 2180
      i32.const 4366204
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load8_u offset=175
    i32.eqz
    if  ;; label = @1
      local.get 0
      i32.const 1
      i32.store8 offset=175
      local.get 0
      i32.load offset=52
      local.get 1
      i32.const 12
      i32.add
      i32.const 3408108
      i32.load
      call 45354
      local.get 1
      i32.load offset=12
      local.tee 0
      i32.const 1
      i32.const 0
      call 48707
      local.get 0
      i32.const 3465952
      i32.load
      i32.const 0
      f32.const 0x0p+0 (;=0;)
      i32.const 0
      call 20996
    end
    local.get 1
    i32.const 16
    i32.add
    global.set 0)
