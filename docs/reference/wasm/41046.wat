  (func (;41046;) (type 8) (param i32 i32 i32 i32) (result i32)
    (local i32)
    i32.const 4365144
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357348
      call 2180
      i32.const 4365144
      i32.const 1
      i32.store8
    end
    local.get 1
    if (result i32)  ;; label = @1
      i32.const 3357348
      i32.load
      call 1900
      local.tee 3
      local.get 1
      i32.load offset=8
      i32.store offset=8
      local.get 1
      i32.load offset=12
      local.set 4
      local.get 3
      i32.const 2
      i32.store offset=16
      local.get 3
      local.get 4
      i32.store offset=12
      local.get 3
      f32.const -0x1.68p+7 (;=-180;)
      f32.const 0x1.68p+7 (;=180;)
      i32.const 0
      call 48613
      f32.store offset=20
      local.get 3
      local.get 1
      f32.load offset=24
      f32.store offset=24
      local.get 3
      local.get 1
      i32.load offset=28
      i32.store offset=28
      local.get 3
      local.get 1
      i32.load offset=32
      i32.store offset=32
      local.get 3
      local.get 1
      i32.load offset=36
      i32.store offset=36
      local.get 3
      local.get 1
      i32.load offset=40
      i32.store offset=40
      local.get 0
      local.get 3
      i32.const 1
      local.get 2
      local.get 3
      call 41042
    else
      i32.const 0
    end)
