  (func (;43175;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 80
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4366537
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 3456380
      call 2180
      i32.const 4366537
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=24
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=16
      local.set 2
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      local.get 2
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=25
      br_if 0 (;@1;)
      local.get 1
      local.get 0
      i32.load offset=16
      i32.const 0
      i32.const 0
      call 20939
      local.get 1
      local.get 1
      i32.load offset=32
      i32.store offset=72
      local.get 1
      i32.const -64
      i32.sub
      local.get 1
      i64.load offset=24
      i64.store
      local.get 1
      local.get 1
      i64.load offset=16
      i64.store offset=56
      local.get 1
      local.get 1
      i64.load offset=8
      i64.store offset=48
      local.get 1
      local.get 1
      i64.load
      i64.store offset=40
      local.get 1
      i32.const 40
      i32.add
      i32.const 3456380
      i32.load
      i32.const 0
      call 20807
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      i32.const 40
      i32.add
      f32.load offset=12
      f32.const 0x1p+0 (;=1;)
      f32.ge
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.const 256
      i32.store16 offset=24
      local.get 0
      local.get 1
      call 43176
    end
    local.get 1
    i32.const 80
    i32.add
    global.set 0)
