  (func (;42714;) (type 26) (param i32 i32 f32 i32)
    (local i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    local.get 3
    local.get 2
    f32.store offset=12
    i32.const 4366171
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 3436008
      call 2180
      i32.const 4366171
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=112
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48812
    if  ;; label = @1
      local.get 0
      i32.load offset=112
      local.tee 1
      local.get 3
      i32.const 12
      i32.add
      i32.const 0
      call 53518
      i32.const 3436008
      i32.load
      i32.const 0
      call 48049
      local.get 1
      i32.load
      local.tee 1
      i32.load offset=796
      local.get 1
      i32.load offset=792
      call_indirect (type 2)
    end
    local.get 0
    i32.load offset=92
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    local.get 1
    i32.const 0
    i32.const 0
    call 48812
    if  ;; label = @1
      local.get 0
      i32.load offset=92
      local.get 3
      f32.load offset=12
      f32.const 0x1.9p+6 (;=100;)
      f32.div
      i32.const 0
      call 20639
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
