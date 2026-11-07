  (func (;41002;) (type 1) (param i32 i32)
    (local i32 f32)
    i32.const 4365107
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4365107
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=72
    local.tee 1
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=72
    end
    local.get 0
    i32.load offset=76
    local.tee 1
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=76
    end
    local.get 0
    local.get 0
    call 40997
    block  ;; label = @1
      local.get 0
      i32.load offset=52
      i32.const 1
      i32.ne
      br_if 0 (;@1;)
      local.get 0
      local.get 0
      local.get 0
      i32.load offset=48
      local.get 0
      call 41006
      local.tee 1
      i32.store offset=64
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      local.get 0
      i32.load offset=64
      local.get 0
      call 41008
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      f32.const 0x0p+0 (;=0;)
      f32.const 0x1p+0 (;=1;)
      i32.const 0
      call 48613
      local.set 3
      local.get 0
      local.get 1
      local.get 0
      f32.load offset=28
      local.get 3
      local.get 0
      call 41009
    end)
