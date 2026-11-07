  (func (;44281;) (type 0) (param i32 i32) (result i32)
    (local i32)
    i32.const 4367386
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4367386
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=16
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
      i32.load offset=16
      i32.const 0
      call 48736
      i32.const 0
      call 48835
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=16
      i32.const 0
      call 29540
      return
    end
    local.get 0
    i32.load offset=20
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
      i32.load offset=20
      i32.const 0
      call 48736
      i32.const 0
      call 48835
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=20
      i32.const 0
      call 29540
      return
    end
    local.get 0
    i32.load offset=84)
