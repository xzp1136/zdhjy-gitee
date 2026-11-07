  (func (;41116;) (type 1) (param i32 i32)
    (local i32 i32 i32 f32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4365194
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3480540
      call 2180
      i32.const 3480544
      call 2180
      i32.const 3436008
      call 2180
      i32.const 3438180
      call 2180
      i32.const 4365194
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=56
      br_if 0 (;@1;)
      local.get 0
      local.get 0
      f32.load offset=48
      local.get 0
      f32.load offset=52
      f32.add
      local.tee 5
      f32.store offset=48
      local.get 0
      i32.load offset=32
      local.tee 1
      i32.load
      local.tee 2
      i32.load offset=572
      local.set 4
      local.get 2
      i32.load offset=568
      local.set 2
      local.get 5
      f32.const 0x1p+0 (;=1;)
      f32.lt
      if  ;; label = @2
        local.get 1
        local.get 5
        local.get 4
        local.get 2
        call_indirect (type 17)
        local.get 3
        local.get 0
        f32.load offset=48
        f32.const 0x1.9p+6 (;=100;)
        f32.mul
        f32.floor
        f32.store offset=12
        local.get 0
        i32.load offset=36
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
        local.get 0
        i32.load offset=40
        local.tee 0
        i32.const 3480540
        i32.load
        local.get 0
        i32.load
        local.tee 0
        i32.load offset=796
        local.get 0
        i32.load offset=792
        call_indirect (type 2)
        br 1 (;@1;)
      end
      local.get 1
      f32.const 0x1p+0 (;=1;)
      local.get 4
      local.get 2
      call_indirect (type 17)
      local.get 0
      i32.load offset=36
      local.tee 1
      i32.const 3438180
      i32.load
      local.get 1
      i32.load
      local.tee 1
      i32.load offset=796
      local.get 1
      i32.load offset=792
      call_indirect (type 2)
      local.get 0
      i32.load offset=40
      local.tee 1
      i32.const 3480544
      i32.load
      local.get 1
      i32.load
      local.tee 1
      i32.load offset=796
      local.get 1
      i32.load offset=792
      call_indirect (type 2)
      local.get 0
      i32.const 1
      i32.store8 offset=56
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
