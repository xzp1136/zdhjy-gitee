  (func (;43590;) (type 1) (param i32 i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366859
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4366859
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=8
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=12
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=20
      local.set 2
      local.get 0
      i32.load offset=8
      local.set 4
      local.get 3
      local.get 0
      i32.load offset=16
      i32.store offset=12
      local.get 1
      i32.load offset=32
      local.get 4
      local.get 3
      i32.const 12
      i32.add
      local.get 2
      local.get 1
      i32.load offset=20
      local.get 1
      i32.load offset=12
      call_indirect (type 7)
    end
    local.get 0
    i32.load offset=24
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48812
    if  ;; label = @1
      local.get 0
      i32.load offset=24
      local.set 0
      i32.const 3360788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 0
      f32.const 0x1p-1 (;=0.5;)
      i32.const 0
      call 48974
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
